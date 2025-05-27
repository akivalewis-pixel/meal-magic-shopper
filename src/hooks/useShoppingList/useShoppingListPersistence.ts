
import { GroceryItem } from "@/types";
import { useShoppingListPersistenceState } from "./useShoppingListPersistenceState";
import { useShoppingListPersistenceActions } from "./useShoppingListPersistenceActions";

export function useShoppingListPersistence(
  availableStores: string[],
  archivedItems: GroceryItem[],
  allItems: GroceryItem[]
) {
  const {
    storeAssignments,
    lastSavedAssignments,
    isInitializedRef,
    isProcessingRef
  } = useShoppingListPersistenceState();

  const { loadFromStorage, saveToLocalStorage } = useShoppingListPersistenceActions({
    storeAssignments,
    lastSavedAssignments,
    isInitializedRef,
    isProcessingRef,
    availableStores,
    archivedItems,
    allItems
  });

  return {
    storeAssignments,
    loadFromStorage,
    saveToLocalStorage,
    isProcessing: () => isProcessingRef.current
  };
}
