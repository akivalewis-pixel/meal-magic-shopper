import { useMemo } from "react";
import { GroceryItem, Meal } from "@/types";
import { generateShoppingList } from "@/utils/groceryUtils";

export function useShoppingListGeneration(
  meals: Meal[],
  pantryItems: string[],
  allItems: GroceryItem[],
  storeAssignments: React.MutableRefObject<Map<string, string>>
) {
  return useMemo(() => {
    console.log("useShoppingListGeneration: Regenerating list with", meals.length, "meals");
    
    let mealItems: GroceryItem[] = [];
    
    if (meals.length > 0) {
      const activeMeals = meals.filter(meal => meal.day && meal.day !== "");
      mealItems = generateShoppingList(activeMeals, pantryItems, []);
    }
    
    // Apply stored assignments with enhanced persistence
    const normalizedMealItems = mealItems.map(item => {
      const storedStore = storeAssignments.current.get(item.name.toLowerCase());
      const assignedStore = storedStore || "Unassigned";
      
      console.log("useShoppingListGeneration: Assigning store for", item.name, "stored:", storedStore, "final:", assignedStore);
      
      return {
        ...item,
        store: assignedStore,
        id: `meal-${item.name}-${item.meal || 'default'}-${Date.now()}-${Math.random()}`,
        source: 'meal' as const,
        __updateTimestamp: Date.now()
      };
    });

    // Keep manual items that don't conflict with meal items
    const manualItems = allItems.filter(item => 
      item.id.startsWith('manual-') && 
      !normalizedMealItems.some(mealItem => 
        mealItem.name.toLowerCase() === item.name.toLowerCase()
      )
    );
    
    const combinedItems = [...normalizedMealItems, ...manualItems];
    
    console.log("useShoppingListGeneration: Final combined items:", 
      combinedItems.map(i => ({ 
        name: i.name, 
        store: i.store, 
        source: i.id.startsWith('manual-') ? 'manual' : 'meal' 
      }))
    );
    
    return combinedItems;
  }, [meals, pantryItems, allItems]);
}
