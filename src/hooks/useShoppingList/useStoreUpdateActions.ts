
import { useCallback } from "react";
import { GroceryItem } from "@/types";
import { useToast } from "@/hooks/use-toast";

interface UseStoreUpdateActionsProps {
  setAvailableStores: React.Dispatch<React.SetStateAction<string[]>>;
  setAllItems: React.Dispatch<React.SetStateAction<GroceryItem[]>>;
  saveToLocalStorage: () => void;
}

export function useStoreUpdateActions({
  setAvailableStores,
  setAllItems,
  saveToLocalStorage
}: UseStoreUpdateActionsProps) {
  const { toast } = useToast();

  const updateStores = useCallback((newStores: string[]) => {
    setAvailableStores(newStores);
    
    // Update items that have invalid stores
    setAllItems(prev => 
      prev.map(item => {
        if (item.store && !newStores.includes(item.store)) {
          return { ...item, store: "Unassigned" };
        }
        return item;
      })
    );
    
    // Save immediately
    saveToLocalStorage();
    
    toast({
      title: "Stores Updated",
      description: "Store list has been updated",
    });
  }, [setAvailableStores, setAllItems, saveToLocalStorage, toast]);

  return { updateStores };
}
