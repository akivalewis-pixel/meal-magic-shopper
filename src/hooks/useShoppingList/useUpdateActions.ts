
import { GroceryItem } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { sortGroceryItems, normalizeStoreValue } from "./utils";
import { logger } from "@/utils/logger";

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
    logger.log("useUpdateActions - Updating item:", updatedItem.name, "to store:", updatedItem.store);
    
    const normalizedStore = normalizeStoreValue(updatedItem.store);
    
    const newItem = { 
      ...updatedItem,
      store: normalizedStore,
      __updateTimestamp: Date.now()
    };
    
    setGroceryItems(prevItems => {
      const updatedItems = prevItems.map(item => {
        if (item.id === newItem.id) {
          return newItem;
        }
        return item;
      });
      
      return sortGroceryItems(updatedItems);
    });
    
    if (newItem.id.startsWith('manual-')) {
      setManualItems(prevItems => {
        const existingIndex = prevItems.findIndex(item => item.id === newItem.id);
        if (existingIndex >= 0) {
          const newManualItems = [...prevItems];
          newManualItems[existingIndex] = newItem;
          return newManualItems;
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
    logger.log("useUpdateActions - Bulk update:", items.length, "items");
    
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
      
      return sortGroceryItems(newItems);
    });
    
    setManualItems(prevItems => {
      const updatedManualItems = prevItems.map(item => {
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
