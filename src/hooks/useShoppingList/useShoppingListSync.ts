
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
  isProcessing?: () => boolean;
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
  saveToLocalStorage,
  isProcessing
}: UseShoppingListSyncProps) {
  const isInitializedRef = useRef(false);

  // Load from localStorage on mount only
  useEffect(() => {
    if (!isInitializedRef.current) {
      console.log("useShoppingListSync: Initial load from storage");
      const savedData = loadFromStorage();
      
      if (savedData.stores) {
        setAvailableStores(savedData.stores);
      }
      if (savedData.archived) {
        console.log("useShoppingListSync: Loading archived items:", savedData.archived.length);
        setArchivedItems(savedData.archived);
      }
      if (savedData.items) {
        const savedManualItems = savedData.items.filter(item => item.id.startsWith('manual-'));
        setManualItems(savedManualItems);
        
        // Load overrides from saved items
        loadOverrides(savedData.items);
      }
      
      console.log("useShoppingListSync: Initial load completed");
      isInitializedRef.current = true;
    }
  }, [loadFromStorage, setAvailableStores, setArchivedItems, loadOverrides]);

  // Sync with global state only when not processing and initialized
  useEffect(() => {
    if (isInitializedRef.current && (!isProcessing || !isProcessing())) {
      console.log("useShoppingListSync: Syncing combined items");
      setAllItems(combinedItems);
    } else if (isProcessing && isProcessing()) {
      console.log("useShoppingListSync: Skipping sync - processing in progress");
    }
  }, [combinedItems, setAllItems, isProcessing]);

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

  return { isInitializedRef, createSetAllItemsHandler };
}
