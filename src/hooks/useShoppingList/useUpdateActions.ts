
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
    
    // Validate and normalize the store value
    const normalizedStore = validateStore(updatedItem.store || "Unassigned");
    
    // Create completely new item object
    const newItem = { 
      ...updatedItem,
      store: normalizedStore,
      __updateTimestamp: Date.now()
    };
    
    console.log("useUpdateActions - Final normalized item:", newItem.name, "store:", newItem.store);
    
    // Update grocery items with complete re-render trigger
    setGroceryItems(prevItems => {
      const updatedItems = prevItems.map(item => 
        item.id === newItem.id ? newItem : item
      );
      console.log("useUpdateActions - Updated items count:", updatedItems.length);
      console.log("useUpdateActions - Item stores after update:", updatedItems.map(i => ({ name: i.name, store: i.store })));
      return sortGroceryItems(updatedItems);
    });
    
    // Update manual items if this item exists there
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
          const normalizedStore = validateStore(updates.store || item.store || "Unassigned");
          return { 
            ...item, 
            ...updates,
            store: normalizedStore,
            __updateTimestamp: updateTimestamp 
          };
        }
        return item;
      });
      
      console.log("useUpdateActions - Bulk update complete, items:", newItems.length);
      return sortGroceryItems(newItems);
    });
    
    // Update manual items
    setManualItems(prevItems => {
      const updatedManualItems = prevItems.map(item => {
        if (itemIdsToUpdate.has(item.id)) {
          const normalizedStore = validateStore(updates.store || item.store || "Unassigned");
          return { 
            ...item, 
            ...updates,
            store: normalizedStore,
            __updateTimestamp: updateTimestamp
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
