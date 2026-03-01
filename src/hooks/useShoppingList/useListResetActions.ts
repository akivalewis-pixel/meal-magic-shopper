
import { useCallback } from "react";
import { GroceryItem } from "@/types";
import { useToast } from "@/hooks/use-toast";

interface UseListResetActionsProps {
  allItems: GroceryItem[];
  setAllItems: React.Dispatch<React.SetStateAction<GroceryItem[]>>;
  setManualItems: React.Dispatch<React.SetStateAction<GroceryItem[]>>;
  setArchivedItems: React.Dispatch<React.SetStateAction<GroceryItem[]>>;
}

export function useListResetActions({
  allItems,
  setAllItems,
  setManualItems,
  setArchivedItems,
}: UseListResetActionsProps) {
  const { toast } = useToast();

  const resetList = useCallback(() => {
    console.log("ListResetActions: Resetting list with", allItems.length, "items");
    
    if (allItems.length === 0) {
      console.log("ListResetActions: List is already empty");
      toast({
        title: "List Already Empty",
        description: "Shopping list is already empty",
      });
      return;
    }
    
    // Archive all current items with unique IDs
    const itemsToArchive = allItems.map(item => ({
      ...item,
      checked: true,
    }));
    
    console.log("ListResetActions: Archiving", itemsToArchive.length, "items");
    
    // Add to archived items
    setArchivedItems(prev => [...itemsToArchive, ...prev]);
    
    // Clear the main list AND manual items immediately
    console.log("ListResetActions: Clearing all items");
    setAllItems([]);
    setManualItems([]);
    
    toast({
      title: "List Reset",
      description: `${itemsToArchive.length} items moved to archive`,
    });
  }, [allItems, setArchivedItems, setAllItems, setManualItems, toast]);

  return { resetList };
}
