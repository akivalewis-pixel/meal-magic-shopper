
import { useRef } from "react";
import { GroceryItem } from "@/types";

interface UseShoppingListToggleProps {
  mealItems: GroceryItem[];
  manualItems: GroceryItem[];
  setManualItems: React.Dispatch<React.SetStateAction<GroceryItem[]>>;
  setArchivedItems: React.Dispatch<React.SetStateAction<GroceryItem[]>>;
  setAllItems: React.Dispatch<React.SetStateAction<GroceryItem[]>>;
  updateOverride: (id: string, overrideData: Partial<GroceryItem>) => void;
  saveToLocalStorage: () => void;
}

export function useShoppingListToggle({
  mealItems,
  manualItems,
  setManualItems,
  setArchivedItems,
  setAllItems,
  updateOverride,
  saveToLocalStorage
}: UseShoppingListToggleProps) {
  const processingItemsRef = useRef<Set<string>>(new Set());

  const toggleItem = (id: string) => {
    // Prevent processing the same item multiple times
    if (processingItemsRef.current.has(id)) return;
    processingItemsRef.current.add(id);
    
    try {
      // Toggle checked state in-place — item stays visible as "purchased"
      setAllItems(prev => prev.map(item => 
        item.id === id 
          ? { ...item, checked: !item.checked, __updateTimestamp: Date.now() }
          : item
      ));
      
      // Also update manual items state if applicable
      if (id.startsWith('manual-')) {
        setManualItems(prev => prev.map(item =>
          item.id === id
            ? { ...item, checked: !item.checked, __updateTimestamp: Date.now() }
            : item
        ));
      }
      
      saveToLocalStorage();
    } finally {
      processingItemsRef.current.delete(id);
    }
  };

  return { toggleItem };
}
