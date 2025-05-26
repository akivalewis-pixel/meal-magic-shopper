
import { useCallback } from "react";
import { GroceryItem } from "@/types";
import { useToast } from "@/hooks/use-toast";

interface UseListResetActionsProps {
  allItems: GroceryItem[];
  setAllItems: React.Dispatch<React.SetStateAction<GroceryItem[]>>;
  setArchivedItems: React.Dispatch<React.SetStateAction<GroceryItem[]>>;
  saveToLocalStorage: () => void;
}

export function useListResetActions({
  allItems,
  setAllItems,
  setArchivedItems,
  saveToLocalStorage
}: UseListResetActionsProps) {
  const { toast } = useToast();

  const resetList = useCallback(() => {
    const itemsToArchive = allItems.map(item => ({
      ...item,
      checked: true,
      id: `archived-${Date.now()}-${item.id}`
    }));
    
    setArchivedItems(prev => [...prev, ...itemsToArchive]);
    setAllItems([]);
    
    // Save immediately
    saveToLocalStorage();
    
    toast({
      title: "List Reset",
      description: `${itemsToArchive.length} items archived`,
    });
  }, [allItems, setArchivedItems, setAllItems, saveToLocalStorage, toast]);

  return { resetList };
}
