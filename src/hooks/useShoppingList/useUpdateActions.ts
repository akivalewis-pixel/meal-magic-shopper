
import { GroceryItem } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { sortGroceryItems, normalizeStoreValue, normalizeGroceryItem } from "./utils";

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
    console.log("useUpdateActions - Updating single item:", updatedItem.name, "to store:", updatedItem.store);
    
    // Validate store value and create a new object to ensure reference change
    const validatedStore = validateStore(updatedItem.store || "");
    const normalizedItem = { 
      ...updatedItem, 
      store: validatedStore,
      __updateTimestamp: Date.now() // Add timestamp to force re-render
    };
    
    console.log("useUpdateActions - Item after normalization:", normalizedItem);
    
    // Create completely new array to ensure React detects changes
    setGroceryItems(prevItems => {
      const newItems = prevItems.map(item => {
        if (item.id === normalizedItem.id) {
          return normalizedItem;
        }
        return { ...item }; // Create new references for all items
      });
      
      // Sort the items after updating
      return sortGroceryItems(newItems);
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
        title: "Item Updated",
        description: `${normalizedItem.name} assigned to ${normalizedItem.store}`,
      });
    } else {
      toast({
        title: "Item Updated", 
        description: `${normalizedItem.name} updated`,
      });
    }
  };

  const handleUpdateMultipleGroceryItems = (items: GroceryItem[], updates: Partial<GroceryItem>) => {
    console.log("useUpdateActions - Bulk update:", items.length, "items with:", updates);
    
    // Validate store value if included in updates
    const normalizedUpdates = { ...updates };
    if (normalizedUpdates.store !== undefined) {
      normalizedUpdates.store = validateStore(normalizedUpdates.store);
    }
    
    const itemIdsToUpdate = new Set(items.map(item => item.id));
    const updateTimestamp = Date.now();
    
    // Update groceryItems with new values
    setGroceryItems(prevItems => {
      const newItems = prevItems.map(item => {
        if (itemIdsToUpdate.has(item.id)) {
          return { 
            ...item, 
            ...normalizedUpdates, 
            __updateTimestamp: updateTimestamp 
          };
        }
        return { ...item };
      });
      
      return sortGroceryItems(newItems);
    });
    
    // Update manualItems if any exist
    setManualItems(prevItems => {
      const newItems = prevItems.map(item => {
        if (itemIdsToUpdate.has(item.id)) {
          return { ...item, ...normalizedUpdates };
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
      description: `${items.length} item${items.length > 1 ? 's' : ''} ${updateType === 'store' ? 'moved to' : 'updated with'} ${updateValue}`,
    });
  };

  return {
    handleUpdateGroceryItem,
    handleUpdateMultipleGroceryItems
  };
};
