
import { GroceryItem } from "@/types";
import { useShoppingListPersistenceState } from "./useShoppingListPersistenceState";
import { useShoppingListPersistenceActions } from "./useShoppingListPersistenceActions";

export function useShoppingListPersistence(
  availableStores: string[],
  archivedItems: GroceryItem[],
  allItems: GroceryItem[],
  setAllItems: (items: GroceryItem[]) => void,
  setArchivedItems: (items: GroceryItem[]) => void
) {
  const {
    storeAssignments,
    lastSavedAssignments,
    isInitializedRef,
    isProcessingRef
  } = useShoppingListPersistenceState();

  const { loadFromStorage, saveToLocalStorage, saveToDatabase } = useShoppingListPersistenceActions({
    storeAssignments,
    lastSavedAssignments,
    isInitializedRef,
    isProcessingRef,
    availableStores,
    archivedItems,
    allItems,
    setAllItems,
    setArchivedItems
  });

  return {
    storeAssignments,
    loadFromStorage,
    saveToLocalStorage,
    saveToDatabase,
    isProcessing: () => isProcessingRef.current
  };
}
