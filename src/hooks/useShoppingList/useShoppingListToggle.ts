
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

  // Enhanced toggle function to properly handle multiple quick selections
  const toggleItem = (id: string) => {
    console.log("useShoppingListToggle: toggleItem called for id:", id);
    
    // Prevent processing the same item multiple times
    if (processingItemsRef.current.has(id)) {
      console.log("useShoppingListToggle: Item already being processed:", id);
      return;
    }
    
    processingItemsRef.current.add(id);
    
    // Find the item in the original sources (mealItems or manualItems) to avoid race conditions
    let item = mealItems.find(item => item.id === id);
    if (!item) {
      item = manualItems.find(item => item.id === id);
    }
    
    if (!item) {
      console.log("useShoppingListToggle: Item not found for id:", id);
      processingItemsRef.current.delete(id);
      return;
    }
    
    console.log("useShoppingListToggle: Found item to toggle:", item.name);
    
    // Mark the item as checked FIRST
    const isMealItem = id.includes('-') && !id.startsWith('manual-');
    
    if (isMealItem) {
      console.log("useShoppingListToggle: Setting meal item as checked via override");
      updateOverride(id, { checked: true });
    } else {
      console.log("useShoppingListToggle: Setting manual item as checked");
      setManualItems(prev => 
        prev.map(manualItem => 
          manualItem.id === id 
            ? { ...manualItem, checked: true, __updateTimestamp: Date.now() }
            : manualItem
        )
      );
    }
    
    // Archive the item immediately and clean up
    setTimeout(() => {
      console.log("useShoppingListToggle: Archiving item after marking as checked");
      
      // Create archived item directly
      const archivedItem = { ...item, checked: true, __updateTimestamp: Date.now() };
      setArchivedItems(prev => [...prev, archivedItem]);
      
      // Clean up processing flag
      processingItemsRef.current.delete(id);
      
      // Save to storage
      setTimeout(saveToLocalStorage, 50);
    }, 50);
  };

  return { toggleItem };
}
