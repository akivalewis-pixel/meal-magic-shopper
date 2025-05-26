
import { useEffect, useCallback } from "react";
import { UnifiedGroceryItem } from "./useUnifiedShoppingList";

interface StorageProps {
  items: UnifiedGroceryItem[];
  availableStores: string[];
  storeAssignments: React.MutableRefObject<Map<string, string>>;
  isInitializedRef: React.MutableRefObject<boolean>;
  isProcessingRef: React.MutableRefObject<boolean>;
  setItems: React.Dispatch<React.SetStateAction<UnifiedGroceryItem[]>>;
  setAvailableStores: React.Dispatch<React.SetStateAction<string[]>>;
}

export function useUnifiedShoppingListStorage({
  items,
  availableStores,
  storeAssignments,
  isInitializedRef,
  isProcessingRef,
  setItems,
  setAvailableStores
}: StorageProps) {
  // Load from localStorage on mount
  useEffect(() => {
    if (!isInitializedRef.current) {
      try {
        const savedItems = localStorage.getItem('shoppingList_unified_items');
        const savedStores = localStorage.getItem('shoppingList_stores');
        const savedAssignments = localStorage.getItem('shoppingList_storeAssignments');

        if (savedStores) {
          setAvailableStores(JSON.parse(savedStores));
        }

        if (savedItems) {
          const loadedItems = JSON.parse(savedItems);
          setItems(loadedItems);
        }

        if (savedAssignments) {
          storeAssignments.current = new Map(JSON.parse(savedAssignments));
        }

        isInitializedRef.current = true;
      } catch (error) {
        console.warn('Failed to load from localStorage:', error);
        isInitializedRef.current = true;
      }
    }
  }, [setItems, setAvailableStores, storeAssignments, isInitializedRef]);

  // Save to localStorage immediately when state changes
  const saveToStorage = useCallback(() => {
    if (!isInitializedRef.current || isProcessingRef.current) return;

    try {
      localStorage.setItem('shoppingList_unified_items', JSON.stringify(items));
      localStorage.setItem('shoppingList_stores', JSON.stringify(availableStores));
      localStorage.setItem('shoppingList_storeAssignments', 
        JSON.stringify(Array.from(storeAssignments.current.entries())));
    } catch (error) {
      console.warn('Failed to save to localStorage:', error);
    }
  }, [items, availableStores, storeAssignments, isInitializedRef, isProcessingRef]);

  // Save whenever items or stores change
  useEffect(() => {
    saveToStorage();
  }, [saveToStorage]);

  return { saveToStorage };
}
