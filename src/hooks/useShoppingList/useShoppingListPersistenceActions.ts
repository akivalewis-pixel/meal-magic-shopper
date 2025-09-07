
import { useCallback } from "react";
import { GroceryItem } from "@/types";
import { useShoppingListDatabaseSync } from "./useShoppingListDatabaseSync";

interface UseShoppingListPersistenceActionsProps {
  storeAssignments: React.MutableRefObject<Map<string, string>>;
  lastSavedAssignments: React.MutableRefObject<string>;
  isInitializedRef: React.MutableRefObject<boolean>;
  isProcessingRef: React.MutableRefObject<boolean>;
  availableStores: string[];
  archivedItems: GroceryItem[];
  allItems: GroceryItem[];
  setAllItems: (items: GroceryItem[]) => void;
  setArchivedItems: (items: GroceryItem[]) => void;
}

export function useShoppingListPersistenceActions({
  storeAssignments,
  lastSavedAssignments,
  isInitializedRef,
  isProcessingRef,
  availableStores,
  archivedItems,
  allItems,
  setAllItems,
  setArchivedItems
}: UseShoppingListPersistenceActionsProps) {
  
  // Initialize database sync
  const { loadFromDatabase, saveToDatabase } = useShoppingListDatabaseSync({
    allItems,
    archivedItems,
    setAllItems,
    setArchivedItems,
    isInitializedRef
  });
  // Load from localStorage and database on mount
  const loadFromStorage = useCallback(async () => {
    try {
      // First load from localStorage for immediate results
      const savedStores = localStorage.getItem('shoppingList_stores');
      const savedArchived = localStorage.getItem('shoppingList_archived');
      const savedItems = localStorage.getItem('shoppingList_allItems');
      const savedAssignments = localStorage.getItem('shoppingList_storeAssignments');
      
      const localResult = {
        stores: savedStores ? JSON.parse(savedStores) : null,
        archived: savedArchived ? JSON.parse(savedArchived) : null,
        items: savedItems ? JSON.parse(savedItems) : null,
        assignments: savedAssignments ? JSON.parse(savedAssignments) : null
      };

      // Initialize store assignments from localStorage
      if (localResult.assignments && Array.isArray(localResult.assignments)) {
        storeAssignments.current = new Map(localResult.assignments);
        lastSavedAssignments.current = savedAssignments;
      }

      if (localResult.items && Array.isArray(localResult.items)) {
        // Initialize store assignments from loaded items
        localResult.items.forEach((item: GroceryItem) => {
          if (item.store && item.store !== "Unassigned") {
            storeAssignments.current.set(item.name.toLowerCase(), item.store);
          }
        });
      }

      // Load from database and merge with localStorage
      console.log("Loading from database to sync with cloud...");
      const dbResult = await loadFromDatabase();
      
      // If database has more recent data, use it; otherwise keep localStorage data
      const hasDbData = dbResult.allItems.length > 0 || dbResult.archivedItems.length > 0;
      const hasLocalData = (localResult.items && localResult.items.length > 0) || (localResult.archived && localResult.archived.length > 0);
      
      let finalResult = localResult;
      
      if (hasDbData && (!hasLocalData || shouldUseDbData(dbResult, localResult))) {
        console.log("Using database data as it's more recent or comprehensive");
        setAllItems(dbResult.allItems);
        setArchivedItems(dbResult.archivedItems);
        finalResult = {
          ...localResult,
          items: dbResult.allItems,
          archived: dbResult.archivedItems
        };
      } else if (hasLocalData && !hasDbData) {
        console.log("Using localStorage data and syncing to database");
        // Sync localStorage data to database
        if (localResult.items) setAllItems(localResult.items);
        if (localResult.archived) setArchivedItems(localResult.archived);
        await saveToDatabase(localResult.items || [], localResult.archived || []);
      }

      isInitializedRef.current = true;
      return finalResult;
    } catch (error) {
      console.warn('Failed to load from storage:', error);
      isInitializedRef.current = true;
      return { stores: null, archived: null, items: null, assignments: null };
    }
  }, [loadFromDatabase, saveToDatabase, setAllItems, setArchivedItems]);

  // Helper function to determine if database data should be used
  const shouldUseDbData = (dbResult: any, localResult: any) => {
    if (!localResult.items && !localResult.archived) return true;
    
    // Compare update timestamps if available
    const dbLatestTimestamp = Math.max(
      ...dbResult.allItems.map((item: GroceryItem) => item.__updateTimestamp || 0),
      ...dbResult.archivedItems.map((item: GroceryItem) => item.__updateTimestamp || 0)
    );
    
    const localLatestTimestamp = Math.max(
      ...(localResult.items || []).map((item: GroceryItem) => item.__updateTimestamp || 0),
      ...(localResult.archived || []).map((item: GroceryItem) => item.__updateTimestamp || 0)
    );
    
    return dbLatestTimestamp > localLatestTimestamp;
  };

  // Completely synchronous save - no delays or timeouts
  const saveToLocalStorage = useCallback(() => {
    if (!isInitializedRef.current) {
      console.log("useShoppingListPersistence: Not initialized, skipping save");
      return;
    }

    // Set processing flag to prevent concurrent operations
    isProcessingRef.current = true;

    try {
      console.log("useShoppingListPersistence: Starting synchronous save");
      console.log("useShoppingListPersistence: Archived items count:", archivedItems.length);
      console.log("useShoppingListPersistence: All items count:", allItems.length);
      
      localStorage.setItem('shoppingList_stores', JSON.stringify(availableStores));
      localStorage.setItem('shoppingList_archived', JSON.stringify(archivedItems));
      localStorage.setItem('shoppingList_allItems', JSON.stringify(allItems));
      
      const currentAssignments = JSON.stringify(Array.from(storeAssignments.current.entries()));
      if (currentAssignments !== lastSavedAssignments.current) {
        localStorage.setItem('shoppingList_storeAssignments', currentAssignments);
        lastSavedAssignments.current = currentAssignments;
      }
      
      console.log("useShoppingListPersistence: Synchronous save completed successfully");
    } catch (error) {
      console.warn('Failed to save to localStorage:', error);
    } finally {
      // Always clear processing flag
      isProcessingRef.current = false;
    }
  }, [availableStores, archivedItems, allItems]);

  return {
    loadFromStorage,
    saveToLocalStorage,
    saveToDatabase
  };
}
