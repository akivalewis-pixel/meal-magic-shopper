
import { useEffect } from "react";
import { GroceryItem, Meal } from "@/types";
import { generateShoppingList } from "@/utils/groceryUtils";

interface UseShoppingListItemsEffectsProps {
  meals: Meal[];
  pantryItems: string[];
  isInitialized: React.MutableRefObject<boolean>;
  removedItemIds: React.MutableRefObject<Set<string>>;
  storeAssignments: React.MutableRefObject<Map<string, string>>;
  groceryItems: GroceryItem[];
  setGroceryItems: React.Dispatch<React.SetStateAction<GroceryItem[]>>;
}

export function useShoppingListItemsEffects({
  meals,
  pantryItems,
  isInitialized,
  removedItemIds,
  storeAssignments,
  groceryItems,
  setGroceryItems
}: UseShoppingListItemsEffectsProps) {
  // Generate items from meals
  useEffect(() => {
    if (!isInitialized.current || meals.length === 0) return;

    const mealItems = generateShoppingList(meals, pantryItems, groceryItems);
    
    // Filter out items that have been manually removed/archived
    const filteredMealItems = mealItems.filter(item => 
      !removedItemIds.current.has(item.id) && !item.checked
    );
    
    // Apply store assignments
    const enhancedItems = filteredMealItems.map(item => {
      const savedStore = storeAssignments.current.get(item.name.toLowerCase());
      return {
        ...item,
        store: savedStore || item.store || "Unassigned"
      };
    });

    // Only update if there are actual changes
    setGroceryItems(prev => {
      const existingIds = new Set(prev.map(item => item.id));
      const newItems = enhancedItems.filter(item => !existingIds.has(item.id));
      
      if (newItems.length > 0) {
        const activeItems = prev.filter(item => !item.checked && !removedItemIds.current.has(item.id));
        return [...activeItems, ...newItems];
      }
      // Always filter out checked items and removed items
      return prev.filter(item => !item.checked && !removedItemIds.current.has(item.id));
    });
  }, [meals, pantryItems, isInitialized.current]);
}
