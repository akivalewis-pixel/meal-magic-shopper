
import { GroceryItem } from "@/types";
import { useShoppingListSyncState } from "./useShoppingListSyncState";
import { useShoppingListSyncEffects } from "./useShoppingListSyncEffects";
import { useShoppingListSyncHandlers } from "./useShoppingListSyncHandlers";

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
  const { isInitializedRef } = useShoppingListSyncState();

  useShoppingListSyncEffects({
    isInitializedRef,
    loadFromStorage,
    setAvailableStores,
    setArchivedItems,
    setManualItems,
    loadOverrides,
    combinedItems,
    setAllItems,
    isProcessing
  });

  const { createSetAllItemsHandler } = useShoppingListSyncHandlers({
    combinedItems,
    mealItems,
    setManualItems,
    setItemOverrides,
    saveToLocalStorage,
    isProcessing
  });

  return { isInitializedRef, createSetAllItemsHandler };
}
