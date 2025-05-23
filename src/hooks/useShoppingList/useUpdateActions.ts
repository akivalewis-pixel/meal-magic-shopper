
import { GroceryItem } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { sortGroceryItems } from "./utils";

interface UseUpdateActionsProps {
  groceryItems: GroceryItem[];
  setGroceryItems: (items: GroceryItem[] | ((prev: GroceryItem[]) => GroceryItem[])) => void;
  manualItems: GroceryItem[];
  setManualItems: (items: GroceryItem[] | ((prev: GroceryItem[]) => GroceryItem[])) => void;
  validateStore: (store: string) => string;
}

export const useUpdateActions = ({
  groceryItems,
  setGroceryItems,
  manualItems,
  setManualItems,
  validateStore
}: UseUpdateActionsProps) => {
  const { toast } = useToast();

  const handleUpdateGroceryItem = (updatedItem: GroceryItem) => {
    console.log("useUpdateActions - Updating item:", updatedItem.name, "to store:", updatedItem.store);
    
    // Create a completely new item object with a unique timestamp
    const newItem = { 
      ...updatedItem,
      store: validateStore(updatedItem.store || "Unassigned"),
      __updateTimestamp: Date.now()
    };
    
    console.log("useUpdateActions - Final item:", newItem);
    
    // Force complete re-render by creating new array
    setGroceryItems(prevItems => {
      const newItems = prevItems.map(item => 
        item.id === newItem.id ? newItem : item
      );
      console.log("useUpdateActions - Updated items array");
      return sortGroceryItems(newItems);
    });
    
    // Update manual items if needed
    setManualItems(prevItems => {
      const existingIndex = prevItems.findIndex(item => item.id === newItem.id);
      if (existingIndex >= 0) {
        const newManualItems = [...prevItems];
        newManualItems[existingIndex] = newItem;
        return newManualItems;
      }
      return prevItems;
    });

    toast({
      title: "Item Updated",
      description: `${newItem.name} ${newItem.store && newItem.store !== "Unassigned" ? `assigned to ${newItem.store}` : 'updated'}`,
    });
  };

  const handleUpdateMultipleGroceryItems = (items: GroceryItem[], updates: Partial<GroceryItem>) => {
    console.log("useUpdateActions - Bulk update:", items.length, "items with:", updates);
    
    const itemIdsToUpdate = new Set(items.map(item => item.id));
    const updateTimestamp = Date.now();
    
    setGroceryItems(prevItems => {
      const newItems = prevItems.map(item => {
        if (itemIdsToUpdate.has(item.id)) {
          return { 
            ...item, 
            ...updates,
            store: validateStore(updates.store || item.store || "Unassigned"),
            __updateTimestamp: updateTimestamp 
          };
        }
        return item;
      });
      
      return sortGroceryItems(newItems);
    });
    
    setManualItems(prevItems => {
      const updatedManualItems = prevItems.map(item => {
        if (itemIdsToUpdate.has(item.id)) {
          return { 
            ...item, 
            ...updates,
            store: validateStore(updates.store || item.store || "Unassigned")
          };
        }
        return item;
      });
      return updatedManualItems;
    });

    const updateType = updates.store ? 'store' : updates.category ? 'category' : 'items';
    const updateValue = updates.store || updates.category || 'updated';
    toast({
      title: "Items Updated",
      description: `${items.length} item${items.length > 1 ? 's' : ''} ${updateType === 'store' ? 'moved to' : 'updated with'} ${updateValue}`,
    });
  };

  return {
    handleUpdateGroceryItem,
    handleUpdateMultipleGroceryItems
  };
};
