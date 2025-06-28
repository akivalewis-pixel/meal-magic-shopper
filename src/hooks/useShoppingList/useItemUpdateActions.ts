
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
    console.log("useItemUpdateActions: Updating item", updatedItem.name, "with store", updatedItem.store);
    
    // Update store assignment persistence immediately
    if (updatedItem.store && updatedItem.store !== "Unassigned") {
      storeAssignments.current.set(updatedItem.name.toLowerCase(), updatedItem.store);
    } else if (updatedItem.store === "Unassigned") {
      storeAssignments.current.delete(updatedItem.name.toLowerCase());
    }
    
    // Force immediate state update with timestamp
    const itemWithTimestamp = {
      ...updatedItem,
      __updateTimestamp: Date.now()
    };
    
    setAllItems(prevItems => {
      const newItems = prevItems.map(item => {
        if (item.id === itemWithTimestamp.id) {
          console.log("useItemUpdateActions: Replacing item", item.name, "with updated version");
          return itemWithTimestamp;
        }
        return item;
      });
      
      console.log("useItemUpdateActions: State updated, triggering re-render");
      return newItems;
    });

    // Save immediately
    setTimeout(() => saveToLocalStorage(), 0);
  }, [setAllItems, storeAssignments, saveToLocalStorage]);

  return { updateItem };
}
