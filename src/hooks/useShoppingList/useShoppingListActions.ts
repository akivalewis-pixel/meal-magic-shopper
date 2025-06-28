
import { useCallback } from "react";
import { GroceryItem } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { normalizeGroceryItem, findMatchingArchivedItem } from "./utils";
import { useConsolidatedUpdateActions } from "./useConsolidatedUpdateActions";

interface UseShoppingListActionsProps {
  allItems: GroceryItem[];
  manualItems: GroceryItem[];
  archivedItems: GroceryItem[];
  setAllItems: React.Dispatch<React.SetStateAction<GroceryItem[]>>;
  setManualItems: React.Dispatch<React.SetStateAction<GroceryItem[]>>;
  setArchivedItems: React.Dispatch<React.SetStateAction<GroceryItem[]>>;
  setAvailableStores: React.Dispatch<React.SetStateAction<string[]>>;
  storeAssignments: React.MutableRefObject<Map<string, string>>;
  saveToLocalStorage: () => void;
}

export function useShoppingListActions({
  allItems,
  manualItems,
  archivedItems,
  setAllItems,
  setManualItems,
  setArchivedItems,
  setAvailableStores,
  storeAssignments,
  saveToLocalStorage
}: UseShoppingListActionsProps) {
  const { toast } = useToast();

  // Use the consolidated update actions
  const { updateItem: consolidatedUpdateItem } = useConsolidatedUpdateActions({
    setAllItems,
    setManualItems,
    storeAssignments,
    saveToLocalStorage
  });

  const updateItem = useCallback((updatedItem: GroceryItem) => {
    const normalizedItem = normalizeGroceryItem(updatedItem);
    
    // Use the consolidated update function
    consolidatedUpdateItem(normalizedItem);
    
    toast({
      title: "Item Updated",
      description: `${normalizedItem.name} updated successfully`,
    });
  }, [consolidatedUpdateItem, toast]);

  const toggleItem = useCallback((id: string) => {
    const item = allItems.find(i => i.id === id);
    if (!item) return;

    // Archive the item
    const archivedItem = { ...item, checked: true };
    setArchivedItems(prev => [archivedItem, ...prev]);
    
    // Remove from main list
    setAllItems(prev => prev.filter(i => i.id !== id));
    
    if (item.id.startsWith('manual-')) {
      setManualItems(prev => prev.filter(i => i.id !== id));
    }
    
    saveToLocalStorage();
    
    toast({
      title: "Item Completed",
      description: `${item.name} moved to archive`,
    });
  }, [allItems, setAllItems, setManualItems, setArchivedItems, saveToLocalStorage, toast]);

  const archiveItem = useCallback((id: string) => {
    toggleItem(id);
  }, [toggleItem]);

  const addItem = useCallback((newItem: Omit<GroceryItem, 'id' | 'checked'>) => {
    // Check for existing archived item
    const existingArchived = findMatchingArchivedItem(newItem as GroceryItem, archivedItems);
    
    let finalItem: GroceryItem;
    
    if (existingArchived) {
      // Restore from archive with updated properties
      finalItem = normalizeGroceryItem({
        ...existingArchived,
        ...newItem,
        checked: false
      });
      
      // Remove from archive
      setArchivedItems(prev => prev.filter(item => item.id !== existingArchived.id));
      
      toast({
        title: "Item Restored",
        description: `${finalItem.name} restored from archive`,
      });
    } else {
      // Create new manual item
      finalItem = normalizeGroceryItem({
        ...newItem,
        id: `manual-${Date.now()}`,
        checked: false
      });
      
      toast({
        title: "Item Added",
        description: `${finalItem.name} added to shopping list`,
      });
    }
    
    setAllItems(prev => [...prev, finalItem]);
    
    if (finalItem.id.startsWith('manual-')) {
      setManualItems(prev => [...prev, finalItem]);
    }

    saveToLocalStorage();
  }, [archivedItems, setAllItems, setManualItems, setArchivedItems, saveToLocalStorage, toast]);

  const updateStores = useCallback((newStores: string[]) => {
    setAvailableStores(newStores);
    
    // Update items with invalid stores
    setAllItems(prev => prev.map(item => {
      if (item.store && !newStores.includes(item.store)) {
        return { ...item, store: "Unassigned" };
      }
      return item;
    }));
    
    saveToLocalStorage();
    
    toast({
      title: "Stores Updated",
      description: "Store list has been updated",
    });
  }, [setAvailableStores, setAllItems, saveToLocalStorage, toast]);

  const resetList = useCallback(() => {
    console.log("ShoppingListActions: Resetting list with", allItems.length, "items");
    
    // Clear all items immediately
    setAllItems([]);
    setManualItems([]);
    
    // Save to localStorage
    saveToLocalStorage();
    
    toast({
      title: "List Reset",
      description: "Shopping list has been reset",
    });
  }, [setAllItems, setManualItems, saveToLocalStorage, toast, allItems.length]);

  const getCurrentItems = useCallback(() => allItems, [allItems]);

  return {
    updateItem,
    toggleItem,
    archiveItem,
    addItem,
    updateStores,
    resetList,
    getCurrentItems
  };
}
