
import { useCallback } from "react";
import { GroceryItem } from "@/types";
import { useToast } from "@/hooks/use-toast";

interface UseItemArchiveActionsProps {
  allItems: GroceryItem[];
  setAllItems: React.Dispatch<React.SetStateAction<GroceryItem[]>>;
  setArchivedItems: React.Dispatch<React.SetStateAction<GroceryItem[]>>;
}

export function useItemArchiveActions({
  allItems,
  setAllItems,
  setArchivedItems
}: UseItemArchiveActionsProps) {
  const { toast } = useToast();

  const archiveItem = useCallback((id: string) => {
    const item = allItems.find(i => i.id === id);
    if (!item) return;

    setArchivedItems(prev => [...prev, { ...item, checked: true }]);
    setAllItems(prev => prev.filter(i => i.id !== id));
    
    toast({
      title: "Item Archived",
      description: `${item.name} moved to archive`,
    });
  }, [allItems, setArchivedItems, setAllItems, toast]);

  return { archiveItem };
}
