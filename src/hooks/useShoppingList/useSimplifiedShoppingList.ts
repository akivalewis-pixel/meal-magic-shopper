
import { useEffect } from "react";
import { Meal } from "@/types";
import { useShoppingListStorage } from "./useShoppingListStorage";
import { useShoppingListItems } from "./useShoppingListItems";
import { useShoppingListStores } from "./useShoppingListStores";

export function useSimplifiedShoppingList(meals: Meal[], pantryItems: string[] = []) {
  const {
    isInitialized,
    removedItemIds,
    storeAssignments,
    loadFromStorage,
    saveToStorage
  } = useShoppingListStorage();

  // Load initial data
  const initialData = loadFromStorage();
  
  const { availableStores, updateStores } = useShoppingListStores(initialData.stores);
  
  const {
    groceryItems,
    archivedItems,
    setGroceryItems,
    setArchivedItems,
    updateItem,
    toggleItem,
    addItem,
    archiveItem,
    resetList
  } = useShoppingListItems({
    meals,
    pantryItems,
    isInitialized,
    removedItemIds,
    storeAssignments,
    saveToStorage: (items, archived, stores) => saveToStorage(items, archived, stores),
    initialItems: initialData.items,
    initialArchived: initialData.archived
  });

  // Auto-save when data changes
  useEffect(() => {
    if (isInitialized.current) {
      saveToStorage(groceryItems, archivedItems, availableStores);
    }
  }, [groceryItems, archivedItems, availableStores, saveToStorage]);

  // Always return only unchecked items that haven't been removed
  const activeGroceryItems = groceryItems.filter(item => 
    !item.checked && !removedItemIds.current.has(item.id)
  );

  // Create a function to get the most current state for printing
  const getCurrentItems = () => {
    // Get the absolute latest state from the groceryItems array
    const currentItems = groceryItems.filter(item => 
      !item.checked && !removedItemIds.current.has(item.id)
    );
    
    console.log("getCurrentItems: Returning", currentItems.length, "current items");
    console.log("getCurrentItems: Current item details:", currentItems.map(item => ({ 
      id: item.id,
      name: item.name, 
      quantity: item.quantity,
      store: item.store || "Unassigned",
      category: item.category,
      checked: item.checked 
    })));
    
    return currentItems;
  };

  console.log("SimplifiedShoppingList: Returning", activeGroceryItems.length, "active items");

  return {
    groceryItems: activeGroceryItems,
    archivedItems,
    availableStores,
    updateItem,
    toggleItem,
    archiveItem,
    addItem,
    updateStores,
    resetList,
    getCurrentItems // Function to get current state for printing
  };
}
