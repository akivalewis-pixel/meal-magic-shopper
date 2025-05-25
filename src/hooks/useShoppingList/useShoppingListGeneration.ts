
import { useMemo, useRef } from "react";
import { GroceryItem, Meal } from "@/types";
import { generateShoppingList } from "@/utils/groceryUtils";

export function useShoppingListGeneration(
  meals: Meal[],
  pantryItems: string[],
  storeAssignments: React.MutableRefObject<Map<string, string>>
) {
  // Use ref to track previous meals to prevent unnecessary regeneration
  const prevMealsRef = useRef<string>('');
  const cachedItemsRef = useRef<GroceryItem[]>([]);

  return useMemo(() => {
    if (meals.length === 0) {
      cachedItemsRef.current = [];
      return [];
    }
    
    // Create a stable key for meals to check if they've actually changed
    const mealsKey = meals
      .filter(meal => meal.day && meal.day !== "")
      .map(meal => `${meal.id}-${meal.title}-${meal.ingredients.join(',')}`)
      .sort()
      .join('|');
    
    // If meals haven't changed, return cached items
    if (mealsKey === prevMealsRef.current && cachedItemsRef.current.length > 0) {
      return cachedItemsRef.current;
    }
    
    try {
      const activeMeals = meals.filter(meal => meal.day && meal.day !== "");
      const mealItems = generateShoppingList(activeMeals, pantryItems, []);
      
      // Generate stable IDs and apply store assignments
      const normalizedMealItems = mealItems.map(item => {
        // Create deterministic ID based on meal and item name (no timestamps)
        const mealId = item.meal?.toLowerCase().replace(/\s+/g, '-') || 'default';
        const itemName = item.name.toLowerCase().replace(/\s+/g, '-');
        const stableId = `meal-${mealId}-${itemName}`;
        
        const storedStore = storeAssignments.current.get(item.name.toLowerCase());
        const assignedStore = storedStore || "Unassigned";
        
        return {
          ...item,
          store: assignedStore,
          id: stableId,
          source: 'meal' as const
        };
      });
      
      // Cache the results
      prevMealsRef.current = mealsKey;
      cachedItemsRef.current = normalizedMealItems;
      
      return normalizedMealItems;
    } catch (error) {
      console.error('Error generating shopping list:', error);
      return cachedItemsRef.current;
    }
  }, [meals, pantryItems]); // Keep dependencies minimal
}
