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
  name: "list_meals",
  title: "List meals",
  description:
    "List meals in the signed-in user's current weekly meal plan. Optionally filter by day of the week.",
  inputSchema: {
    day: z
      .string()
      .optional()
      .describe("Optional day filter, e.g. 'Monday'. Omit to list every planned meal."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ day }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const supabase = supabaseForUser(ctx);
    let query = supabase
      .from("meals")
      .select("id, day, title, recipe_url, ingredients, dietary_preferences, notes, rating")
      .eq("user_id", ctx.getUserId());
    if (day) query = query.eq("day", day);
    const { data, error } = await query;
    if (error) {
      return { content: [{ type: "text", text: error.message }], isError: true };
    }
    return {
      content: [{ type: "text", text: JSON.stringify(data ?? []) }],
      structuredContent: { meals: data ?? [] },
    };
  },
});
