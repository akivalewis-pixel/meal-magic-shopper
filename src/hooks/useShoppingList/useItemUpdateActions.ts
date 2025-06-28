
import { useCallback } from "react";
import { GroceryItem } from "@/types";

interface UseItemUpdateActionsProps {
  setAllItems: React.Dispatch<React.SetStateAction<GroceryItem[]>>;
  storeAssignments: React.MutableRefObject<Map<string, string>>;
  saveToLocalStorage: () => void;
}

export function useItemUpdateActions({
  setAllItems,
  storeAssignments,
  saveToLocalStorage
}: UseItemUpdateActionsProps) {
  const updateItem = useCallback((updatedItem: GroceryItem) => {
    // Update store assignment persistence immediately
    if (updatedItem.store && updatedItem.store !== "Unassigned") {
      storeAssignments.current.set(updatedItem.name.toLowerCase(), updatedItem.store);
    } else if (updatedItem.store === "Unassigned") {
      storeAssignments.current.delete(updatedItem.name.toLowerCase());
    }
    
    // Update the actual state
    setAllItems(prevItems => {
      return prevItems.map(item => {
        if (item.id === updatedItem.id) {
          return {
            ...updatedItem,
            __updateTimestamp: Date.now()
          };
        }
        return item;
      });
    });

    // Save immediately and synchronously
    saveToLocalStorage();
  }, [setAllItems, storeAssignments, saveToLocalStorage]);

  return { updateItem };
}
