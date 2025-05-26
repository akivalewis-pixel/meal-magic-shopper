
import { Meal } from "@/types";
import { useSimplifiedShoppingList } from "./useSimplifiedShoppingList";

export function useShoppingListCore(meals: Meal[], pantryItems: string[] = []) {
  return useSimplifiedShoppingList(meals, pantryItems);
}
