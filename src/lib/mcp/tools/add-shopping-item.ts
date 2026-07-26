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
  name: "add_shopping_item",
  title: "Add shopping list item",
  description:
    "Add a manual item to the signed-in user's shopping list. Use for items not tied to a specific meal.",
  inputSchema: {
    name: z.string().trim().min(1).describe("Item name, e.g. 'Milk'."),
    quantity: z.string().trim().optional().describe("Quantity string, e.g. '2 gallons'."),
    category: z.string().trim().optional().describe("Optional grocery category, e.g. 'dairy'."),
    store: z.string().trim().optional().describe("Optional store name."),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
  handler: async ({ name, quantity, category, store }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const supabase = supabaseForUser(ctx);
    const { data, error } = await supabase
      .from("shopping_list_items")
      .insert({
        user_id: ctx.getUserId(),
        name,
        quantity: quantity ?? "1",
        category: category ?? "other",
        store: store ?? "Unassigned",
        checked: false,
        is_manual: true,
      })
      .select()
      .single();
    if (error) {
      return { content: [{ type: "text", text: error.message }], isError: true };
    }
    return {
      content: [{ type: "text", text: `Added ${name} to your shopping list.` }],
      structuredContent: { item: data },
    };
  },
});
