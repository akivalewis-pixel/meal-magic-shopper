
import { useCallback } from "react";
import { GroceryItem } from "@/types";

interface UseShoppingListArchiveProps {
  combinedItems: GroceryItem[];
  setArchivedItems: React.Dispatch<React.SetStateAction<GroceryItem[]>>;
  updateOverride: (id: string, overrideData: Partial<GroceryItem>) => void;
  setManualItems: React.Dispatch<React.SetStateAction<GroceryItem[]>>;
  saveToLocalStorage: () => void;
}

export function useShoppingListArchive({
  combinedItems,
  setArchivedItems,
  updateOverride,
  setManualItems,
  saveToLocalStorage
}: UseShoppingListArchiveProps) {
  const archiveItem = useCallback((id: string) => {
    console.log("useShoppingListArchive: Archiving item with id:", id);
    const item = combinedItems.find(i => i.id === id);
    if (!item) {
      console.log("useShoppingListArchive: Item not found for archiving:", id);
      return;
    }

    console.log("useShoppingListArchive: Found item to archive:", item.name);

    // Create archived item
    const archivedItem = { ...item, checked: true, __updateTimestamp: Date.now() };
    
    // Add to archived items immediately
    setArchivedItems(prev => [...prev, archivedItem]);
    
    // Update the item to mark it as checked
    const isMealItem = id.includes('-') && !id.startsWith('manual-');
    
    if (isMealItem) {
      // Mark meal item as checked in overrides
      updateOverride(id, { checked: true });
    } else {
      // Mark manual item as checked
      setManualItems(prev => 
        prev.map(item => 
          item.id === id 
            ? { ...item, checked: true, __updateTimestamp: Date.now() }
            : item
        )
      );
    }
    
    setTimeout(saveToLocalStorage, 100);
  }, [combinedItems, setArchivedItems, updateOverride, setManualItems, saveToLocalStorage]);

  return { archiveItem };
}
