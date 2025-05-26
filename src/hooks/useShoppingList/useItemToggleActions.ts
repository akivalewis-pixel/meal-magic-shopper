
import { useCallback } from "react";
import { GroceryItem } from "@/types";

interface UseItemToggleActionsProps {
  setAllItems: React.Dispatch<React.SetStateAction<GroceryItem[]>>;
}

export function useItemToggleActions({
  setAllItems
}: UseItemToggleActionsProps) {
  const toggleItem = useCallback((id: string) => {
    setAllItems(prev => 
      prev.map(item => 
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    );
  }, [setAllItems]);

  return { toggleItem };
}
