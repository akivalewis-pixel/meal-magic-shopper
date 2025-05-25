
import { useState } from "react";
import { Meal, GroceryItem } from "@/types";
import { useShoppingListState } from "./useShoppingListState";
import { useShoppingListPersistence } from "./useShoppingListPersistence";
import { useShoppingListGeneration } from "./useShoppingListGeneration";
import { useShoppingListActions } from "./useShoppingListActions";
import { useShoppingListItems } from "./useShoppingListItems";
import { useShoppingListOverrides } from "./useShoppingListOverrides";
import { useShoppingListArchive } from "./useShoppingListArchive";
import { useShoppingListToggle } from "./useShoppingListToggle";
import { useShoppingListUpdate } from "./useShoppingListUpdate";
import { useShoppingListSync } from "./useShoppingListSync";

export function useShoppingListCore(meals: Meal[], pantryItems: string[] = []) {
  const {
    allItems,
    setAllItems,
    archivedItems,
    setArchivedItems,
    availableStores,
    setAvailableStores
  } = useShoppingListState();

  const [manualItems, setManualItems] = useState<GroceryItem[]>([]);

  const {
    itemOverrides,
    updateOverride,
    loadOverrides,
    setItemOverrides
  } = useShoppingListOverrides();

  const {
    storeAssignments,
    loadFromStorage,
    saveToLocalStorage
  } = useShoppingListPersistence(availableStores, archivedItems, allItems);

  const mealItems = useShoppingListGeneration(
    meals,
    pantryItems,
    storeAssignments
  );

  const { combinedItems } = useShoppingListItems({
    mealItems,
    manualItems,
    itemOverrides,
    storeAssignments
  });

  const { toggleItem } = useShoppingListToggle({
    mealItems,
    manualItems,
    setManualItems,
    setArchivedItems,
    updateOverride,
    saveToLocalStorage
  });

  const { updateItem } = useShoppingListUpdate({
    storeAssignments,
    setManualItems,
    updateOverride,
    saveToLocalStorage
  });

  const { archiveItem } = useShoppingListArchive({
    combinedItems,
    setArchivedItems,
    updateOverride,
    setManualItems,
    saveToLocalStorage
  });

  const { isInitializedRef, createSetAllItemsHandler } = useShoppingListSync({
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
  });

  const actions = useShoppingListActions({
    allItems: combinedItems,
    setAllItems: createSetAllItemsHandler(setManualItems, setItemOverrides),
    archivedItems,
    setArchivedItems,
    storeAssignments,
    saveToLocalStorage: () => setTimeout(saveToLocalStorage, 100),
    setAvailableStores
  });

  return {
    groceryItems: combinedItems,
    archivedItems,
    availableStores,
    updateItem,
    toggleItem,
    archiveItem,
    ...actions
  };
}
