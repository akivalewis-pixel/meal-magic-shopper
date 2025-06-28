
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
  console.log("useShoppingList: Called with", meals.length, "meals");
  
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
    storeAssignments,
    saveToLocalStorage
  } = useShoppingListSync({ meals, pantryItems });

  // Actions - now includes storeAssignments
  const actions = useShoppingListActions({
    allItems,
    manualItems,
    archivedItems,
    setAllItems,
    setManualItems,
    setArchivedItems,
    setAvailableStores,
    storeAssignments,
    saveToLocalStorage
  });

  // Update global state reference
  useMemo(() => {
    shoppingListStateRef.currentItems = allItems;
    shoppingListStateRef.availableStores = availableStores;
    console.log("useShoppingList: Updated global state reference with", allItems.length, "items");
  }, [allItems, availableStores]);

  const loadShoppingList = (items: any[], stores: string[]) => {
    console.log("useShoppingList: Loading shopping list with", items.length, "items and", stores.length, "stores");
    setAllItems(items);
    setAvailableStores(stores);
    const manual = items.filter(item => item.id.startsWith('manual-'));
    setManualItems(manual);
  };

  console.log("useShoppingList: Returning", allItems.length, "grocery items");

  return {
    groceryItems: allItems,
    archivedItems,
    availableStores,
    ...actions,
    getAvailableStores: () => availableStores,
    loadShoppingList
  };
}
