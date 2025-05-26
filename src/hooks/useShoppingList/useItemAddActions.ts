
import { useCallback } from "react";
import { GroceryItem } from "@/types";
import { useToast } from "@/hooks/use-toast";

interface UseItemAddActionsProps {
  setAllItems: React.Dispatch<React.SetStateAction<GroceryItem[]>>;
  saveToLocalStorage: () => void;
}

export function useItemAddActions({
  setAllItems,
  saveToLocalStorage
}: UseItemAddActionsProps) {
  const { toast } = useToast();

  const addItem = useCallback((newItem: GroceryItem) => {
    const itemWithId = {
      ...newItem,
      id: `manual-${newItem.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
      store: newItem.store || "Unassigned",
      source: 'manual' as const
    };
    
    setAllItems(prev => [...prev, itemWithId]);
    
    // Save immediately
    saveToLocalStorage();
    
    toast({
      title: "Item Added",
      description: `${newItem.name} added to shopping list`,
    });
  }, [setAllItems, saveToLocalStorage, toast]);

  return { addItem };
}
