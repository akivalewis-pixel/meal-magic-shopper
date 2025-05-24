
import { useEffect } from "react";
import { Meal } from "@/types";
import { useShoppingListState } from "./useShoppingListState";
import { useShoppingListPersistence } from "./useShoppingListPersistence";
import { useShoppingListGeneration } from "./useShoppingListGeneration";
import { useShoppingListActions } from "./useShoppingListActions";

export function useSimpleShoppingList(meals: Meal[], pantryItems: string[] = []) {
  const {
    allItems,
    setAllItems,
    archivedItems,
    setArchivedItems,
    availableStores,
    setAvailableStores
  } = useShoppingListState();

  const {
    storeAssignments,
    loadFromStorage,
    saveToLocalStorage
  } = useShoppingListPersistence(availableStores, archivedItems, allItems);

  const combinedItems = useShoppingListGeneration(
    meals,
    pantryItems,
    allItems,
    storeAssignments
  );

  const actions = useShoppingListActions({
    allItems,
    setAllItems,
    archivedItems,
    setArchivedItems,
    storeAssignments,
    saveToLocalStorage,
    setAvailableStores
  });

  // Load from localStorage on mount
  useEffect(() => {
    const savedData = loadFromStorage();
    
    if (savedData.stores) {
      setAvailableStores(savedData.stores);
    }
    if (savedData.archived) {
      setArchivedItems(savedData.archived);
    }
    if (savedData.items) {
      setAllItems(savedData.items);
    }
  }, [loadFromStorage, setAvailableStores, setArchivedItems, setAllItems]);

  // Update items when meals change
  useEffect(() => {
    setAllItems(combinedItems);
  }, [combinedItems, setAllItems]);

  return {
    groceryItems: allItems,
    archivedItems,
    availableStores,
    ...actions
  };
}
