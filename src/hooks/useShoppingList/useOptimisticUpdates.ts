
import { useState, useRef, useCallback } from "react";
import { GroceryItem } from "@/types";

export function useOptimisticUpdates() {
  const [optimisticUpdates, setOptimisticUpdates] = useState<Map<string, Partial<GroceryItem>>>(new Map());
  const pendingUpdates = useRef<Map<string, NodeJS.Timeout>>(new Map());

  const applyOptimisticUpdate = useCallback((itemId: string, updates: Partial<GroceryItem>) => {
    console.log("useOptimisticUpdates: Applying optimistic update for", itemId, updates);
    
    // Clear any pending timeout for this item
    const existingTimeout = pendingUpdates.current.get(itemId);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }

    // Apply the optimistic update immediately
    setOptimisticUpdates(prev => {
      const newMap = new Map(prev);
      newMap.set(itemId, { ...newMap.get(itemId), ...updates });
      return newMap;
    });

    // Set a timeout to clear the optimistic update if not confirmed
    const timeout = setTimeout(() => {
      console.log("useOptimisticUpdates: Clearing optimistic update for", itemId);
      setOptimisticUpdates(prev => {
        const newMap = new Map(prev);
        newMap.delete(itemId);
        return newMap;
      });
      pendingUpdates.current.delete(itemId);
    }, 5000); // Clear after 5 seconds if not confirmed

    pendingUpdates.current.set(itemId, timeout);
  }, []);

  const confirmUpdate = useCallback((itemId: string) => {
    console.log("useOptimisticUpdates: Confirming update for", itemId);
    
    // Clear the timeout and optimistic update
    const existingTimeout = pendingUpdates.current.get(itemId);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
      pendingUpdates.current.delete(itemId);
    }

    setOptimisticUpdates(prev => {
      const newMap = new Map(prev);
      newMap.delete(itemId);
      return newMap;
    });
  }, []);

  const applyOptimisticUpdatesToItems = useCallback((items: GroceryItem[]): GroceryItem[] => {
    if (optimisticUpdates.size === 0) return items;

    return items.map(item => {
      const updates = optimisticUpdates.get(item.id);
      if (updates) {
        console.log("useOptimisticUpdates: Applying optimistic data to", item.name, updates);
        return { ...item, ...updates };
      }
      return item;
    });
  }, [optimisticUpdates]);

  return {
    applyOptimisticUpdate,
    confirmUpdate,
    applyOptimisticUpdatesToItems,
    hasPendingUpdates: optimisticUpdates.size > 0
  };
}
