
import { useCallback } from "react";
import { GroceryItem } from "@/types";
import { UnifiedGroceryItem, ItemStatus } from "./useUnifiedShoppingList";

interface ActionsProps {
  items: UnifiedGroceryItem[];
  setItems: React.Dispatch<React.SetStateAction<UnifiedGroceryItem[]>>;
  storeAssignments: React.MutableRefObject<Map<string, string>>;
  isProcessingRef: React.MutableRefObject<boolean>;
}

export function useUnifiedShoppingListActions({
  items,
  setItems,
  storeAssignments,
  isProcessingRef
}: ActionsProps) {
  // Toggle item status (active -> checked -> archived)
  const toggleItem = useCallback((id: string) => {
    isProcessingRef.current = true;
    
    setItems(currentItems => {
      return currentItems.map(item => {
        if (item.id === id && item.status === 'active') {
          console.log("Unified: Checking item", item.name);
          return {
            ...item,
            status: 'checked' as ItemStatus,
            __updateTimestamp: Date.now()
          };
        }
        return item;
      });
    });

    // Clear processing flag after a brief moment to allow state to settle
    setTimeout(() => {
      isProcessingRef.current = false;
    }, 100);
  }, [setItems, isProcessingRef]);

  // Archive item (move from checked to archived)
  const archiveItem = useCallback((id: string) => {
    setItems(currentItems => {
      return currentItems.map(item => {
        if (item.id === id && item.status === 'checked') {
          console.log("Unified: Archiving item", item.name);
          return {
            ...item,
            status: 'archived' as ItemStatus,
            __updateTimestamp: Date.now()
          };
        }
        return item;
      });
    });
  }, [setItems]);

  // Update item
  const updateItem = useCallback((updatedItem: UnifiedGroceryItem) => {
    // Update store assignment
    if (updatedItem.store && updatedItem.store !== "Unassigned") {
      storeAssignments.current.set(updatedItem.name.toLowerCase(), updatedItem.store);
    }

    setItems(currentItems => {
      return currentItems.map(item => {
        if (item.id === updatedItem.id) {
          return {
            ...updatedItem,
            __updateTimestamp: Date.now()
          };
        }
        return item;
      });
    });
  }, [setItems, storeAssignments]);

  // Add manual item
  const addItem = useCallback((newItem: Omit<GroceryItem, 'id' | 'checked'>) => {
    const unifiedItem: UnifiedGroceryItem = {
      ...newItem,
      id: `manual-${newItem.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
      status: 'active',
      source: 'manual',
      store: newItem.store || "Unassigned"
    };

    setItems(currentItems => [...currentItems, unifiedItem]);
  }, [setItems]);

  // Reset list
  const resetList = useCallback(() => {
    setItems(currentItems => 
      currentItems.map(item => ({ ...item, status: 'archived' as ItemStatus }))
    );
  }, [setItems]);

  return {
    toggleItem,
    archiveItem,
    updateItem,
    addItem,
    resetList
  };
}
