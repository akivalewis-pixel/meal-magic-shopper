
import { useCallback, useRef } from "react";
import { GroceryItem } from "@/types";

export function useShoppingListStorage() {
  const isInitialized = useRef(false);
  const removedItemIds = useRef<Set<string>>(new Set());
  const storeAssignments = useRef<Map<string, string>>(new Map());

  const loadFromStorage = useCallback(() => {
    if (isInitialized.current) return { items: [], archived: [], stores: [], assignments: [], removedIds: [] };
    
    try {
      const savedItems = localStorage.getItem('shoppingList_items');
      const savedArchived = localStorage.getItem('shoppingList_archived');
      const savedStores = localStorage.getItem('shoppingList_stores');
      const savedAssignments = localStorage.getItem('shoppingList_storeAssignments');
      const savedRemovedIds = localStorage.getItem('shoppingList_removedIds');

      const items = savedItems ? JSON.parse(savedItems).filter((item: GroceryItem) => !item.checked) : [];
      const archived = savedArchived ? JSON.parse(savedArchived) : [];
      const stores = savedStores ? JSON.parse(savedStores) : ["Unassigned", "Supermarket", "Farmers Market", "Specialty Store"];
      const assignments = savedAssignments ? JSON.parse(savedAssignments) : [];
      const removedIds = savedRemovedIds ? JSON.parse(savedRemovedIds) : [];

      if (assignments.length > 0) {
        storeAssignments.current = new Map(assignments);
      }
      if (removedIds.length > 0) {
        removedItemIds.current = new Set(removedIds);
      }

      isInitialized.current = true;
      console.log('ShoppingListStorage: Data loaded from localStorage');
      
      return { items, archived, stores, assignments, removedIds };
    } catch (error) {
      console.warn('Failed to load from localStorage:', error);
      isInitialized.current = true;
      return { items: [], archived: [], stores: ["Unassigned", "Supermarket", "Farmers Market", "Specialty Store"], assignments: [], removedIds: [] };
    }
  }, []);

  const saveToStorage = useCallback((groceryItems: GroceryItem[], archivedItems: GroceryItem[], availableStores: string[]) => {
    if (!isInitialized.current) return;
    
    try {
      const activeItems = groceryItems.filter(item => !item.checked);
      localStorage.setItem('shoppingList_items', JSON.stringify(activeItems));
      localStorage.setItem('shoppingList_archived', JSON.stringify(archivedItems));
      localStorage.setItem('shoppingList_stores', JSON.stringify(availableStores));
      localStorage.setItem('shoppingList_storeAssignments', 
        JSON.stringify(Array.from(storeAssignments.current.entries())));
      localStorage.setItem('shoppingList_removedIds', 
        JSON.stringify(Array.from(removedItemIds.current)));
      
      console.log('ShoppingListStorage: Data saved to localStorage');
    } catch (error) {
      console.warn('Failed to save to localStorage:', error);
    }
  }, []);

  return {
    isInitialized,
    removedItemIds,
    storeAssignments,
    loadFromStorage,
    saveToStorage
  };
}
