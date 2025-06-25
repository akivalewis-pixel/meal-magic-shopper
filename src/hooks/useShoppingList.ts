
import { useMemo } from "react";
import { Meal } from "@/types";
import { useShoppingListSync } from "./useShoppingList/useShoppingListSync";
import { useShoppingListActions } from "./useShoppingList/useShoppingListActions";

// Global state reference for external access
export const shoppingListStateRef = {
  currentItems: [] as any[],
  availableStores: [] as string[]
};

export function useShoppingList(meals: Meal[], pantryItems: string[] = []) {
  // Core state and sync
  const {
    allItems,
    manualItems,
    archivedItems,
    availableStores,
    setAllItems,
    setManualItems,
    setArchivedItems,
    setAvailableStores,
    saveToLocalStorage
  } = useShoppingListSync({ meals, pantryItems });

  // Actions
  const actions = useShoppingListActions({
    allItems,
    manualItems,
    archivedItems,
    setAllItems,
    setManualItems,
    setArchivedItems,
    setAvailableStores,
    saveToLocalStorage
  });

  // Update global state reference
  useMemo(() => {
    shoppingListStateRef.currentItems = allItems;
    shoppingListStateRef.availableStores = availableStores;
  }, [allItems, availableStores]);

  const loadShoppingList = (items: any[], stores: string[]) => {
    setAllItems(items);
    setAvailableStores(stores);
    const manual = items.filter(item => item.id.startsWith('manual-'));
    setManualItems(manual);
  };

  return {
    groceryItems: allItems,
    archivedItems,
    availableStores,
    ...actions,
    getAvailableStores: () => availableStores,
    loadShoppingList
  };
}
