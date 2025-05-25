
import { Meal } from "@/types";
import { useUnifiedShoppingList } from "./useUnifiedShoppingList";

export function useShoppingListCore(meals: Meal[], pantryItems: string[] = []) {
  return useUnifiedShoppingList(meals, pantryItems);
}
