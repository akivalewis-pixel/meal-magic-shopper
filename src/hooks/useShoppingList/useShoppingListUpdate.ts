
import { GroceryItem } from "@/types";

interface UseShoppingListUpdateProps {
  storeAssignments: React.MutableRefObject<Map<string, string>>;
  setManualItems: React.Dispatch<React.SetStateAction<GroceryItem[]>>;
  updateOverride: (id: string, overrideData: Partial<GroceryItem>) => void;
  saveToLocalStorage: () => void;
}

export function useShoppingListUpdate({
  storeAssignments,
  setManualItems,
  updateOverride,
  saveToLocalStorage
}: UseShoppingListUpdateProps) {
  // Simplified update function
  const updateItem = (updatedItem: GroceryItem) => {
    console.log("useShoppingListUpdate: Updating item", updatedItem.name);
    
    // Update store assignment
    if (updatedItem.store && updatedItem.store !== "Unassigned") {
      storeAssignments.current.set(updatedItem.name.toLowerCase(), updatedItem.store);
    } else if (updatedItem.store === "Unassigned") {
      storeAssignments.current.delete(updatedItem.name.toLowerCase());
    }

    const isMealItem = updatedItem.id.includes('-') && !updatedItem.id.startsWith('manual-');
    
    if (isMealItem) {
      // Store as override for meal items
      updateOverride(updatedItem.id, {
        name: updatedItem.name,
        quantity: updatedItem.quantity,
        category: updatedItem.category,
        store: updatedItem.store,
        checked: updatedItem.checked
      });
    } else {
      // Update manual item directly
      setManualItems(prev => 
        prev.map(item => 
          item.id === updatedItem.id 
            ? { ...updatedItem, __updateTimestamp: Date.now() }
            : item
        )
      );
    }

    // Save changes
    setTimeout(saveToLocalStorage, 100);
  };

  return { updateItem };
}
