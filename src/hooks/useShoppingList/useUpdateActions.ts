
import { GroceryItem } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { sortGroceryItems, normalizeStoreValue } from "./utils";

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
    console.log("useUpdateActions - Updating item:", updatedItem.name, "to store:", updatedItem.store, "ID:", updatedItem.id);
    
    const normalizedStore = normalizeStoreValue(updatedItem.store);
    console.log("useUpdateActions - Normalized store:", normalizedStore);
    
    const newItem = { 
      ...updatedItem,
      store: normalizedStore,
      __updateTimestamp: Date.now()
    };
    
    console.log("useUpdateActions - Creating new item with store:", newItem.store);
    
    // Force a complete state update to ensure re-render
    setGroceryItems(prevItems => {
      const updatedItems = prevItems.map(item => {
        if (item.id === newItem.id) {
          console.log("useUpdateActions - Replacing item:", item.name, "old store:", item.store, "new store:", newItem.store);
          return newItem;
        }
        return item;
      });
      
      const sortedItems = sortGroceryItems(updatedItems);
      console.log("useUpdateActions - Sorted items by store:", sortedItems.map(i => ({ name: i.name, store: i.store })));
      return sortedItems;
    });
    
    // Update manual items as well if this is a manual item
    if (newItem.id.startsWith('manual-')) {
      console.log("useUpdateActions - Updating manual item state for:", newItem.name);
      setManualItems(prevItems => {
        const existingIndex = prevItems.findIndex(item => item.id === newItem.id);
        if (existingIndex >= 0) {
          const newManualItems = [...prevItems];
          newManualItems[existingIndex] = newItem;
          console.log("useUpdateActions - Updated manual item at index:", existingIndex);
          return newManualItems;
        } else {
          console.log("useUpdateActions - Manual item not found in manual items state");
        }
        return prevItems;
      });
    }

    toast({
      title: "Item Updated",
      description: `${newItem.name} ${newItem.store && newItem.store !== "Unassigned" ? `moved to ${newItem.store}` : 'updated'}`,
    });
  };

  const handleUpdateMultipleGroceryItems = (items: GroceryItem[], updates: Partial<GroceryItem>) => {
    console.log("useUpdateActions - Bulk update:", items.length, "items with:", updates);
    
    const itemIdsToUpdate = new Set(items.map(item => item.id));
    const updateTimestamp = Date.now();
    
    setGroceryItems(prevItems => {
      const newItems = prevItems.map(item => {
        if (itemIdsToUpdate.has(item.id)) {
          const normalizedStore = normalizeStoreValue(updates.store || item.store);
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
          const normalizedStore = normalizeStoreValue(updates.store || item.store);
          const updated = { 
            ...item, 
            ...updates,
            store: normalizedStore,
            __updateTimestamp: updateTimestamp
          };
          console.log("useUpdateActions - Bulk updating manual item:", item.name, "to store:", normalizedStore);
          return updated;
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
