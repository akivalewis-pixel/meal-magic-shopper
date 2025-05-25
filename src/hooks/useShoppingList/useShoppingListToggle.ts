
import { useRef } from "react";
import { GroceryItem } from "@/types";

interface UseShoppingListToggleProps {
  mealItems: GroceryItem[];
  manualItems: GroceryItem[];
  setManualItems: React.Dispatch<React.SetStateAction<GroceryItem[]>>;
  setArchivedItems: React.Dispatch<React.SetStateAction<GroceryItem[]>>;
  updateOverride: (id: string, overrideData: Partial<GroceryItem>) => void;
  saveToLocalStorage: () => void;
}

export function useShoppingListToggle({
  mealItems,
  manualItems,
  setManualItems,
  setArchivedItems,
  updateOverride,
  saveToLocalStorage
}: UseShoppingListToggleProps) {
  const processingItemsRef = useRef<Set<string>>(new Set());

  const toggleItem = (id: string) => {
    console.log("useShoppingListToggle: toggleItem called for id:", id);
    
    // Prevent processing the same item multiple times
    if (processingItemsRef.current.has(id)) {
      console.log("useShoppingListToggle: Item already being processed:", id);
      return;
    }
    
    processingItemsRef.current.add(id);
    
    try {
      // Find the item in the original sources
      let item = mealItems.find(item => item.id === id);
      if (!item) {
        item = manualItems.find(item => item.id === id);
      }
      
      if (!item) {
        console.log("useShoppingListToggle: Item not found for id:", id);
        return;
      }
      
      console.log("useShoppingListToggle: Found item to toggle:", item.name);
      
      // Create archived item immediately with checked status
      const archivedItem = { ...item, checked: true, __updateTimestamp: Date.now() };
      
      // Update all states synchronously in a batch
      const isMealItem = id.includes('-') && !id.startsWith('manual-');
      
      // Batch all state updates together
      if (isMealItem) {
        console.log("useShoppingListToggle: Marking meal item as checked via override");
        updateOverride(id, { checked: true });
      } else {
        console.log("useShoppingListToggle: Marking manual item as checked");
        setManualItems(prev => 
          prev.map(manualItem => 
            manualItem.id === id 
              ? { ...manualItem, checked: true, __updateTimestamp: Date.now() }
              : manualItem
          )
        );
      }
      
      // Add to archived items - check for duplicates
      setArchivedItems(prev => {
        const exists = prev.some(archivedItem => archivedItem.id === id);
        if (exists) {
          console.log("useShoppingListToggle: Item already archived:", id);
          return prev;
        }
        console.log("useShoppingListToggle: Adding to archive:", item.name);
        return [...prev, archivedItem];
      });
      
      // Save immediately and synchronously
      console.log("useShoppingListToggle: Saving to localStorage immediately");
      saveToLocalStorage();
      
    } finally {
      // Always clean up processing flag
      processingItemsRef.current.delete(id);
    }
  };

  return { toggleItem };
}
