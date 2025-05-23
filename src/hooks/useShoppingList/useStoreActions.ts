
import { useToast } from "@/hooks/use-toast";
import { GroceryItem } from "@/types";

interface UseStoreActionsProps {
  setAvailableStores: (stores: string[]) => void;
  groceryItems: GroceryItem[];
  setGroceryItems: (items: GroceryItem[] | ((prev: GroceryItem[]) => GroceryItem[])) => void;
}

export const useStoreActions = ({
  setAvailableStores,
  groceryItems,
  setGroceryItems
}: UseStoreActionsProps) => {
  const { toast } = useToast();

  const handleUpdateStores = (stores: string[]) => {
    console.log("Updating stores:", stores);
    
    // Update the available stores list
    setAvailableStores(stores);
    
    // If a store was removed, update any items that were assigned to it
    const availableStoreSet = new Set(stores);
    const itemsToUpdate: GroceryItem[] = [];
    
    groceryItems.forEach(item => {
      if (item.store && item.store !== "Unassigned" && !availableStoreSet.has(item.store)) {
        itemsToUpdate.push(item);
      }
    });
    
    // If any items need to be updated, reassign them to "Unassigned"
    if (itemsToUpdate.length > 0) {
      const timestamp = Date.now();
      setGroceryItems(prevItems => 
        prevItems.map(item => {
          if (item.store && item.store !== "Unassigned" && !availableStoreSet.has(item.store)) {
            return { 
              ...item, 
              store: "Unassigned", 
              __updateTimestamp: timestamp
            };
          }
          return item;
        })
      );
      
      console.log(`Updated ${itemsToUpdate.length} items to Unassigned because their store was removed`);
    }

    toast({
      title: "Stores Updated",
      description: `Your store list has been updated${itemsToUpdate.length > 0 ? ` and ${itemsToUpdate.length} items were reassigned` : ''}`,
    });
  };

  // Helper function to validate and normalize store values
  const validateStore = (store: string): string => {
    console.log("Validating store:", store);
    if (!store || store.trim() === "" || store === "undefined" || store === "null") {
      return "Unassigned";
    }
    return store.trim();
  };

  return {
    handleUpdateStores,
    validateStore
  };
};
