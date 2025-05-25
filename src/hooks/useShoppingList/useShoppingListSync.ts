
import { useEffect, useRef } from "react";
import { GroceryItem } from "@/types";

interface UseShoppingListSyncProps {
  combinedItems: GroceryItem[];
  mealItems: GroceryItem[];
  setAllItems: React.Dispatch<React.SetStateAction<GroceryItem[]>>;
  setItemOverrides: React.Dispatch<React.SetStateAction<Map<string, Partial<GroceryItem>>>>;
  setManualItems: React.Dispatch<React.SetStateAction<GroceryItem[]>>;
  setAvailableStores: React.Dispatch<React.SetStateAction<string[]>>;
  setArchivedItems: React.Dispatch<React.SetStateAction<GroceryItem[]>>;
  loadFromStorage: () => any;
  loadOverrides: (items: GroceryItem[]) => void;
  saveToLocalStorage: () => void;
}

export function useShoppingListSync({
  combinedItems,
  mealItems,
  setAllItems,
  setItemOverrides,
  setManualItems,
  setAvailableStores,
  setArchivedItems,
  loadFromStorage,
  loadOverrides,
  saveToLocalStorage
}: UseShoppingListSyncProps) {
  const isInitializedRef = useRef(false);

  // Load from localStorage on mount
  useEffect(() => {
    if (!isInitializedRef.current) {
      const savedData = loadFromStorage();
      
      if (savedData.stores) {
        setAvailableStores(savedData.stores);
      }
      if (savedData.archived) {
        setArchivedItems(savedData.archived);
      }
      if (savedData.items) {
        const savedManualItems = savedData.items.filter(item => item.id.startsWith('manual-'));
        setManualItems(savedManualItems);
        
        // Load overrides from saved items
        loadOverrides(savedData.items);
      }
      
      console.log("useShoppingListSync: Loaded from storage");
      isInitializedRef.current = true;
    }
  }, [loadFromStorage, setAvailableStores, setArchivedItems, loadOverrides]);

  // Sync with global state only when needed
  useEffect(() => {
    if (isInitializedRef.current) {
      setAllItems(combinedItems);
    }
  }, [combinedItems, setAllItems]);

  // Create setAllItems handler for actions
  const createSetAllItemsHandler = (setManualItems: React.Dispatch<React.SetStateAction<GroceryItem[]>>, setItemOverrides: React.Dispatch<React.SetStateAction<Map<string, Partial<GroceryItem>>>>) => {
    return (items: GroceryItem[] | ((prev: GroceryItem[]) => GroceryItem[])) => {
      // Handle both function and direct updates
      let updatedItems: GroceryItem[];
      if (typeof items === 'function') {
        updatedItems = items(combinedItems);
      } else {
        updatedItems = items;
      }
      
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
      setTimeout(saveToLocalStorage, 100);
    };
  };

  return { isInitializedRef, createSetAllItemsHandler };
}
