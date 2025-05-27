
import { useEffect } from "react";
import { GroceryItem } from "@/types";

interface UseShoppingListSyncEffectsProps {
  isInitializedRef: React.MutableRefObject<boolean>;
  loadFromStorage: () => any;
  setAvailableStores: React.Dispatch<React.SetStateAction<string[]>>;
  setArchivedItems: React.Dispatch<React.SetStateAction<GroceryItem[]>>;
  setManualItems: React.Dispatch<React.SetStateAction<GroceryItem[]>>;
  loadOverrides: (items: GroceryItem[]) => void;
  combinedItems: GroceryItem[];
  setAllItems: React.Dispatch<React.SetStateAction<GroceryItem[]>>;
  isProcessing?: () => boolean;
}

export function useShoppingListSyncEffects({
  isInitializedRef,
  loadFromStorage,
  setAvailableStores,
  setArchivedItems,
  setManualItems,
  loadOverrides,
  combinedItems,
  setAllItems,
  isProcessing
}: UseShoppingListSyncEffectsProps) {
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
}
