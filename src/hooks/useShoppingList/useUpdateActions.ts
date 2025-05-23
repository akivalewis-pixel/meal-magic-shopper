
import { GroceryItem } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { sortGroceryItems, normalizeStoreValue, normalizeGroceryItem } from "./utils";

interface UseUpdateActionsProps {
  groceryItems: GroceryItem[];
  setGroceryItems: (items: GroceryItem[] | ((prev: GroceryItem[]) => GroceryItem[])) => void;
  manualItems: GroceryItem[];
  setManualItems: (items: GroceryItem[] | ((prev: GroceryItem[]) => GroceryItem[])) => void;
}

export const useUpdateActions = ({
  groceryItems,
  setGroceryItems,
  manualItems,
  setManualItems
}: UseUpdateActionsProps) => {
  const { toast } = useToast();

  const handleUpdateGroceryItem = (updatedItem: GroceryItem) => {
    console.log("useUpdateActions - Updating single item:", updatedItem.name, "to store:", updatedItem.store);
    
    // Normalize the entire item to ensure consistency
    const normalizedItem = normalizeGroceryItem(updatedItem);
    
    console.log("useUpdateActions - Normalized item store:", normalizedItem.store);
    
    // Create completely new array and new objects to ensure React detects changes
    setGroceryItems(prevItems => {
      const newItems = prevItems.map(item => {
        if (item.id === normalizedItem.id) {
          // Create a completely new object with a new timestamp to force re-render
          return { 
            ...normalizedItem,
            __updateTimestamp: Date.now() // Force object reference change
          };
        }
        return { ...item }; // Create new objects for all items
      });
      
      const sortedItems = sortGroceryItems(newItems);
      console.log("useUpdateActions - After single update, item in list:", 
        sortedItems.find(item => item.id === normalizedItem.id));
      return sortedItems;
    });
    
    // Update in manualItems if it exists there
    setManualItems(prevItems => {
      const existingIndex = prevItems.findIndex(item => item.id === normalizedItem.id);
      if (existingIndex >= 0) {
        const newItems = [...prevItems];
        newItems[existingIndex] = { ...normalizedItem };
        return newItems;
      }
      return prevItems;
    });

    // Show toast for store updates
    if (normalizedItem.store && normalizedItem.store !== "Unassigned") {
      toast({
        title: "Store Updated",
        description: `${normalizedItem.name} assigned to ${normalizedItem.store}`,
      });
    } else {
      toast({
        title: "Store Updated", 
        description: `${normalizedItem.name} moved to Unassigned`,
      });
    }
  };

  const handleUpdateMultipleGroceryItems = (items: GroceryItem[], updates: Partial<GroceryItem>) => {
    console.log("useUpdateActions - Bulk update:", items.length, "items with:", updates);
    
    // Normalize updates
    const normalizedUpdates = { ...updates };
    if (normalizedUpdates.store !== undefined) {
      normalizedUpdates.store = normalizeStoreValue(normalizedUpdates.store);
      console.log("useUpdateActions - Normalized bulk store value:", normalizedUpdates.store);
    }
    
    const itemIdsToUpdate = new Set(items.map(item => item.id));
    const updateTimestamp = Date.now();
    
    // Create completely new array and new objects to ensure React detects changes
    setGroceryItems(prevItems => {
      const newItems = prevItems.map(item => {
        if (itemIdsToUpdate.has(item.id)) {
          const updatedItem = normalizeGroceryItem({ ...item, ...normalizedUpdates });
          console.log("useUpdateActions - Bulk updating:", item.name, "from:", item.store, "to:", updatedItem.store);
          // Add timestamp to force re-render
          return { ...updatedItem, __updateTimestamp: updateTimestamp };
        }
        return { ...item }; // Create new objects for all items
      });
      
      const sortedItems = sortGroceryItems(newItems);
      console.log("useUpdateActions - After bulk update, sample updated items:", 
        sortedItems.filter(item => itemIdsToUpdate.has(item.id)).slice(0, 3).map(item => ({ name: item.name, store: item.store })));
      return sortedItems;
    });
    
    // Update manualItems if any of the updated items exist there
    setManualItems(prevItems => {
      const newItems = prevItems.map(item => {
        if (itemIdsToUpdate.has(item.id)) {
          return normalizeGroceryItem({ ...item, ...normalizedUpdates });
        }
        return item;
      });
      return newItems;
    });

    // Show success toast
    const updateType = normalizedUpdates.store ? 'store' : normalizedUpdates.category ? 'category' : 'items';
    const updateValue = normalizedUpdates.store || normalizedUpdates.category || 'updated';
    toast({
      title: "Items Updated",
      description: `${items.length} item${items.length > 1 ? 's' : ''} moved to ${updateValue}`,
    });
  };

  return {
    handleUpdateGroceryItem,
    handleUpdateMultipleGroceryItems
  };
};
