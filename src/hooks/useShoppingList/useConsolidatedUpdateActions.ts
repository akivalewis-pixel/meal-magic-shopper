
import { useCallback } from "react";
import { GroceryItem } from "@/types";

interface UseConsolidatedUpdateActionsProps {
  setAllItems: React.Dispatch<React.SetStateAction<GroceryItem[]>>;
  setManualItems: React.Dispatch<React.SetStateAction<GroceryItem[]>>;
  storeAssignments: React.MutableRefObject<Map<string, string>>;
  saveToLocalStorage: () => void;
}

export function useConsolidatedUpdateActions({
  setAllItems,
  setManualItems,
  storeAssignments,
  saveToLocalStorage
}: UseConsolidatedUpdateActionsProps) {
  
  // Single consolidated update function that handles all item updates
  const updateItem = useCallback((updatedItem: GroceryItem) => {
    console.log(`ConsolidatedUpdateActions: Updating item ${updatedItem.name}`, {
      id: updatedItem.id,
      store: updatedItem.store,
      quantity: updatedItem.quantity,
      category: updatedItem.category
    });

    // Update store assignment persistence FIRST
    if (updatedItem.store && updatedItem.store !== "Unassigned") {
      const oldAssignment = storeAssignments.current.get(updatedItem.name.toLowerCase());
      if (oldAssignment !== updatedItem.store) {
        console.log(`ConsolidatedUpdateActions: Store assignment changed from '${oldAssignment}' to '${updatedItem.store}' for ${updatedItem.name}`);
        storeAssignments.current.set(updatedItem.name.toLowerCase(), updatedItem.store);
      }
    } else if (updatedItem.store === "Unassigned") {
      const wasDeleted = storeAssignments.current.delete(updatedItem.name.toLowerCase());
      if (wasDeleted) {
        console.log(`ConsolidatedUpdateActions: Removed store assignment for ${updatedItem.name}`);
      }
    }

    // Add update timestamp to force re-renders
    const itemWithTimestamp = {
      ...updatedItem,
      __updateTimestamp: Date.now()
    };

    // Update all items list
    setAllItems(prevItems => {
      const newItems = prevItems.map(item => {
        if (item.id === updatedItem.id) {
          console.log(`ConsolidatedUpdateActions: Found and updating item in allItems: ${item.name}`);
          return itemWithTimestamp;
        }
        return item;
      });
      
      console.log(`ConsolidatedUpdateActions: Updated allItems, total count: ${newItems.length}`);
      return newItems;
    });

    // Update manual items if applicable
    if (updatedItem.id.startsWith('manual-')) {
      setManualItems(prevItems => {
        const newItems = prevItems.map(item => {
          if (item.id === updatedItem.id) {
            console.log(`ConsolidatedUpdateActions: Found and updating item in manualItems: ${item.name}`);
            return itemWithTimestamp;
          }
          return item;
        });
        
        console.log(`ConsolidatedUpdateActions: Updated manualItems, total count: ${newItems.length}`);
        return newItems;
      });
    }

    // Save to localStorage immediately
    console.log(`ConsolidatedUpdateActions: Saving to localStorage for ${updatedItem.name}`);
    saveToLocalStorage();
  }, [setAllItems, setManualItems, storeAssignments, saveToLocalStorage]);

  return { updateItem };
}
