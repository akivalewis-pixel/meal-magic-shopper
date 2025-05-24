
import { useRef, useEffect, useCallback } from "react";
import { GroceryItem } from "@/types";

export function useShoppingListPersistence(
  availableStores: string[],
  archivedItems: GroceryItem[],
  allItems: GroceryItem[]
) {
  const storeAssignments = useRef<Map<string, string>>(new Map());
  const lastSavedAssignments = useRef<string>('');

  // Load from localStorage on mount
  const loadFromStorage = useCallback(() => {
    const savedStores = localStorage.getItem('shoppingList_stores');
    const savedArchived = localStorage.getItem('shoppingList_archived');
    const savedItems = localStorage.getItem('shoppingList_allItems');
    const savedAssignments = localStorage.getItem('shoppingList_storeAssignments');
    
    const result = {
      stores: savedStores ? JSON.parse(savedStores) : null,
      archived: savedArchived ? JSON.parse(savedArchived) : null,
      items: savedItems ? JSON.parse(savedItems) : null,
      assignments: savedAssignments ? JSON.parse(savedAssignments) : null
    };

    if (result.assignments) {
      storeAssignments.current = new Map(result.assignments);
      lastSavedAssignments.current = savedAssignments;
      console.log("useShoppingListPersistence: Loaded store assignments:", result.assignments);
    }

    if (result.items) {
      // Initialize store assignments from loaded items
      result.items.forEach((item: GroceryItem) => {
        if (item.store && item.store !== "Unassigned") {
          storeAssignments.current.set(item.name.toLowerCase(), item.store);
        }
      });
    }

    return result;
  }, []);

  // Save to localStorage
  const saveToLocalStorage = useCallback(() => {
    localStorage.setItem('shoppingList_stores', JSON.stringify(availableStores));
    localStorage.setItem('shoppingList_archived', JSON.stringify(archivedItems));
    localStorage.setItem('shoppingList_allItems', JSON.stringify(allItems));
    
    const currentAssignments = JSON.stringify(Array.from(storeAssignments.current.entries()));
    if (currentAssignments !== lastSavedAssignments.current) {
      localStorage.setItem('shoppingList_storeAssignments', currentAssignments);
      lastSavedAssignments.current = currentAssignments;
      console.log("useShoppingListPersistence: Saved store assignments:", currentAssignments);
    }
  }, [availableStores, archivedItems, allItems]);

  useEffect(() => {
    saveToLocalStorage();
  }, [saveToLocalStorage]);

  return {
    storeAssignments,
    loadFromStorage,
    saveToLocalStorage
  };
}
