
import { useMemo } from "react";
import { GroceryItem, Meal } from "@/types";
import { generateShoppingList } from "@/utils/groceryUtils";

export function useShoppingListGeneration(
  meals: Meal[],
  pantryItems: string[],
  storeAssignments: React.MutableRefObject<Map<string, string>>
) {
  return useMemo(() => {
    if (meals.length === 0) {
      return [];
    }
    
    const activeMeals = meals.filter(meal => meal.day && meal.day !== "");
    const mealItems = generateShoppingList(activeMeals, pantryItems, []);
    
    // Generate stable IDs and apply store assignments
    const normalizedMealItems = mealItems.map(item => {
      const stableId = `meal-${item.meal || 'default'}-${item.name.toLowerCase().replace(/\s+/g, '-')}`;
      const storedStore = storeAssignments.current.get(item.name.toLowerCase());
      const assignedStore = storedStore || "Unassigned";
      
      return {
        ...item,
        store: assignedStore,
        id: stableId,
        source: 'meal' as const
      };
    });
    
    return normalizedMealItems;
  }, [meals, pantryItems]); // Removed allItems dependency to break the loop
}
