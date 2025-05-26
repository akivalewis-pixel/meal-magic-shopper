import { useEffect } from "react";
import { Meal } from "@/types";
import { generateShoppingList } from "@/utils/groceryUtils";
import { UnifiedGroceryItem, ItemStatus } from "./useUnifiedShoppingList";

interface SyncProps {
  meals: Meal[];
  pantryItems: string[];
  items: UnifiedGroceryItem[];
  setItems: React.Dispatch<React.SetStateAction<UnifiedGroceryItem[]>>;
  storeAssignments: React.MutableRefObject<Map<string, string>>;
  isInitializedRef: React.MutableRefObject<boolean>;
}

export function useUnifiedShoppingListSync({
  meals,
  pantryItems,
  items,
  setItems,
  storeAssignments,
  isInitializedRef
}: SyncProps) {
  // Generate meal items and sync with existing items
  useEffect(() => {
    if (!isInitializedRef.current) return;

    const mealGroceryItems = generateShoppingList(meals, pantryItems);
    
    setItems(currentItems => {
      // Keep existing manual items and checked/archived items
      const manualItems = currentItems.filter(item => item.source === 'manual');
      const existingMealItems = currentItems.filter(item => item.source === 'meal');
      
      // Convert new meal items to unified format
      const newMealItems: UnifiedGroceryItem[] = mealGroceryItems.map(mealItem => {
        // Check if this item already exists
        const existingItem = existingMealItems.find(item => item.id === mealItem.id);
        
        if (existingItem) {
          // Keep existing item but update with fresh meal data if not modified
          return {
            ...existingItem,
            // Only update if item is still active (not checked/archived)
            ...(existingItem.status === 'active' ? {
              name: existingItem.originalMealData?.name || mealItem.name,
              quantity: existingItem.originalMealData?.quantity || mealItem.quantity,
              category: existingItem.originalMealData?.category || mealItem.category,
            } : {}),
            originalMealData: {
              name: mealItem.name,
              quantity: mealItem.quantity,
              category: mealItem.category,
              store: mealItem.store
            }
          };
        }

        // Create new meal item
        const savedStore = storeAssignments.current.get(mealItem.name.toLowerCase());
        return {
          ...mealItem,
          status: 'active' as ItemStatus,
          source: 'meal' as const,
          store: savedStore || mealItem.store || "Unassigned",
          originalMealData: {
            name: mealItem.name,
            quantity: mealItem.quantity,
            category: mealItem.category,
            store: mealItem.store
          }
        };
      });

      return [...newMealItems, ...manualItems];
    });
  }, [meals, pantryItems, setItems, storeAssignments, isInitializedRef]);
}
