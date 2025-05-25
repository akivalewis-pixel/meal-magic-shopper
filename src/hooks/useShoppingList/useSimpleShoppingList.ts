
import { Meal } from "@/types";
import { useShoppingListCore } from "./useShoppingListCore";

export function useSimpleShoppingList(meals: Meal[], pantryItems: string[] = []) {
  return useShoppingListCore(meals, pantryItems);
}
