
import { useRef, useEffect, useCallback } from "react";
import { GroceryItem } from "@/types";

export function useShoppingListPersistence(
  availableStores: string[],
  archivedItems: GroceryItem[],
  allItems: GroceryItem[]
) {
  const storeAssignments = useRef<Map<string, string>>(new Map());
  const lastSavedAssignments = useRef<string>('');
  const saveTimeoutRef = useRef<NodeJS.Timeout>();
  const isInitializedRef = useRef(false);

  // Load from localStorage on mount
  const loadFromStorage = useCallback(() => {
    try {
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

      if (result.assignments && Array.isArray(result.assignments)) {
        storeAssignments.current = new Map(result.assignments);
        lastSavedAssignments.current = savedAssignments;
      }

      if (result.items && Array.isArray(result.items)) {
        // Initialize store assignments from loaded items
        result.items.forEach((item: GroceryItem) => {
          if (item.store && item.store !== "Unassigned") {
            storeAssignments.current.set(item.name.toLowerCase(), item.store);
          }
        });
      }

      isInitializedRef.current = true;
      return result;
    } catch (error) {
      console.warn('Failed to load from localStorage:', error);
      isInitializedRef.current = true;
      return { stores: null, archived: null, items: null, assignments: null };
    }
  }, []);

  // Debounced save to localStorage
  const saveToLocalStorage = useCallback(() => {
    if (!isInitializedRef.current) return;

    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Set new timeout for debounced save
    saveTimeoutRef.current = setTimeout(() => {
      try {
        localStorage.setItem('shoppingList_stores', JSON.stringify(availableStores));
        localStorage.setItem('shoppingList_archived', JSON.stringify(archivedItems));
        localStorage.setItem('shoppingList_allItems', JSON.stringify(allItems));
        
        const currentAssignments = JSON.stringify(Array.from(storeAssignments.current.entries()));
        if (currentAssignments !== lastSavedAssignments.current) {
          localStorage.setItem('shoppingList_storeAssignments', currentAssignments);
          lastSavedAssignments.current = currentAssignments;
        }
      } catch (error) {
        console.warn('Failed to save to localStorage:', error);
      }
    }, 300); // 300ms debounce
  }, [availableStores, archivedItems, allItems]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  return {
    storeAssignments,
    loadFromStorage,
    saveToLocalStorage
  };
}
