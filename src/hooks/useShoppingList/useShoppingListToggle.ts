
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
    
    // Find the item in the original sources
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
    
    // Create archived item immediately with checked status
    const archivedItem = { ...item, checked: true, __updateTimestamp: Date.now() };
    
    // Update all states synchronously to prevent race conditions
    const isMealItem = id.includes('-') && !id.startsWith('manual-');
    
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
    
    // Add to archived items immediately
    setArchivedItems(prev => {
      // Check if item is already archived to prevent duplicates
      if (prev.find(archivedItem => archivedItem.id === id)) {
        return prev;
      }
      return [...prev, archivedItem];
    });
    
    // Clean up processing flag immediately
    processingItemsRef.current.delete(id);
    
    // Save to storage with minimal delay
    setTimeout(saveToLocalStorage, 50);
  };

  return { toggleItem };
}
