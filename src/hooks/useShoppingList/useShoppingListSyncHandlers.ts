
import { GroceryItem } from "@/types";

interface UseShoppingListSyncHandlersProps {
  combinedItems: GroceryItem[];
  mealItems: GroceryItem[];
  setManualItems: React.Dispatch<React.SetStateAction<GroceryItem[]>>;
  setItemOverrides: React.Dispatch<React.SetStateAction<Map<string, Partial<GroceryItem>>>>;
  saveToLocalStorage: () => void;
  isProcessing?: () => boolean;
}

export function useShoppingListSyncHandlers({
  combinedItems,
  mealItems,
  setManualItems,
  setItemOverrides,
  saveToLocalStorage,
  isProcessing
}: UseShoppingListSyncHandlersProps) {
  // Create setAllItems handler for actions
  const createSetAllItemsHandler = (setManualItems: React.Dispatch<React.SetStateAction<GroceryItem[]>>, setItemOverrides: React.Dispatch<React.SetStateAction<Map<string, Partial<GroceryItem>>>>) => {
    return (items: GroceryItem[] | ((prev: GroceryItem[]) => GroceryItem[])) => {
      // Skip updates if processing
      if (isProcessing && isProcessing()) {
        console.log("useShoppingListSync: Skipping setAllItems - processing in progress");
        return;
      }

      // Handle both function and direct updates
      let updatedItems: GroceryItem[];
      if (typeof items === 'function') {
        updatedItems = items(combinedItems);
      } else {
        updatedItems = items;
      }
      
      console.log("useShoppingListSync: Processing setAllItems with", updatedItems.length, "items");
      
      // Separate manual items and overrides
      const newManualItems = updatedItems.filter(item => item.id.startsWith('manual-'));
      setManualItems(newManualItems);
      
      // Save overrides for meal items
      const newOverrides = new Map<string, Partial<GroceryItem>>();
      updatedItems.forEach(item => {
        if (item.id.includes('-') && !item.id.startsWith('manual-')) {
          const originalMealItem = mealItems.find(mi => mi.id === item.id);
          if (originalMealItem) {
            const overrideData: Partial<GroceryItem> = {};
            if (item.name !== originalMealItem.name) overrideData.name = item.name;
            if (item.quantity !== originalMealItem.quantity) overrideData.quantity = item.quantity;
            if (item.category !== originalMealItem.category) overrideData.category = item.category;
            if (item.store !== originalMealItem.store) overrideData.store = item.store;
            if (item.checked !== (originalMealItem.checked || false)) overrideData.checked = item.checked;
            
            if (Object.keys(overrideData).length > 0) {
              newOverrides.set(item.id, { ...overrideData, __updateTimestamp: Date.now() });
            }
          }
        }
      });
      
      setItemOverrides(newOverrides);
      
      // Save immediately and synchronously
      saveToLocalStorage();
    };
  };

  return { createSetAllItemsHandler };
}
