import { auth, defineMcp } from "@lovable.dev/mcp-js";
import listMealsTool from "./tools/list-meals";
import listWeeklyPlansTool from "./tools/list-weekly-plans";
import listShoppingItemsTool from "./tools/list-shopping-items";
import addShoppingItemTool from "./tools/add-shopping-item";

// OAuth issuer must be the direct supabase.co host, built from the project ref.
const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "meal-magic-mcp",
  title: "Meal Magic Shopper",
  version: "0.1.0",
  instructions:
    "Tools to read and modify the signed-in user's meal plans, saved weekly plans, and shopping list in Meal Magic Shopper.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [listMealsTool, listWeeklyPlansTool, listShoppingItemsTool, addShoppingItemTool],
});
