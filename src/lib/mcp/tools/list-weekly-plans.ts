import { createClient } from "@supabase/supabase-js";
import { defineTool, type ToolContext } from "@lovable.dev/mcp-js";
import { z } from "zod";

function supabaseForUser(ctx: ToolContext) {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
    global: { headers: { Authorization: `Bearer ${ctx.getToken()}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export default defineTool({
  name: "list_weekly_plans",
  title: "List saved weekly meal plans",
  description:
    "List the signed-in user's saved weekly meal plans. Optionally include the meals for each plan.",
  inputSchema: {
    includeMeals: z
      .boolean()
      .optional()
      .describe("If true, include each plan's meals (day, title, ingredients)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ includeMeals }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const supabase = supabaseForUser(ctx);
    const { data: plans, error } = await supabase
      .from("weekly_meal_plans")
      .select("id, name, week_start_date, created_at")
      .eq("user_id", ctx.getUserId())
      .order("created_at", { ascending: false });
    if (error) {
      return { content: [{ type: "text", text: error.message }], isError: true };
    }
    let result: unknown = plans ?? [];
    if (includeMeals && plans && plans.length > 0) {
      const { data: planMeals, error: mealsErr } = await supabase
        .from("weekly_plan_meals")
        .select("plan_id, day, title, recipe_url, ingredients, dietary_preferences, notes, rating")
        .in("plan_id", plans.map((p) => p.id));
      if (mealsErr) {
        return { content: [{ type: "text", text: mealsErr.message }], isError: true };
      }
      result = plans.map((p) => ({
        ...p,
        meals: (planMeals ?? []).filter((m) => m.plan_id === p.id),
      }));
    }
    return {
      content: [{ type: "text", text: JSON.stringify(result) }],
      structuredContent: { plans: result },
    };
  },
});
