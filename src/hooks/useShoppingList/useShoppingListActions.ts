
import { useCallback } from "react";
import { GroceryItem } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { normalizeGroceryItem, findMatchingArchivedItem } from "./utils";
import { useConsolidatedUpdateActions } from "./useConsolidatedUpdateActions";
import { useListResetActions } from "./useListResetActions";
import { v4 as uuidv4 } from 'uuid';

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

  // Use the proper reset actions that archive items
  const { resetList } = useListResetActions({
    allItems,
    setAllItems,
    setManualItems,
    setArchivedItems,
    saveToLocalStorage
  });

  const updateItem = useCallback((updatedItem: GroceryItem) => {
    console.log("ShoppingListActions: updateItem called for", updatedItem.name, "with changes:", {
      category: updatedItem.category,
      store: updatedItem.store,
      quantity: updatedItem.quantity
    });
    
    const normalizedItem = normalizeGroceryItem(updatedItem);
    
    // Use the consolidated update function
    consolidatedUpdateItem(normalizedItem);
    
    // Only show toast for significant updates, not minor field changes
    const hasSignificantChange = updatedItem.quantity !== undefined || updatedItem.store !== undefined;
    if (hasSignificantChange) {
      toast({
        title: "Item Updated",
        description: `${normalizedItem.name} updated successfully`,
      });
    }
  }, [consolidatedUpdateItem, toast]);

  const toggleItem = useCallback((id: string) => {
    const item = allItems.find(i => i.id === id);
    if (!item) return;

    // Toggle purchased state in-place — item stays visible with strikethrough
    setAllItems(prev => prev.map(i => 
      i.id === id 
        ? { ...i, checked: !i.checked, __updateTimestamp: Date.now() }
        : i
    ));
    
    // Also update manual items state if applicable
    if (id.startsWith('manual-')) {
      setManualItems(prev => prev.map(i =>
        i.id === id
          ? { ...i, checked: !i.checked, __updateTimestamp: Date.now() }
          : i
      ));
    }
    
    setTimeout(() => saveToLocalStorage(), 0);
  }, [allItems, setAllItems, setManualItems, saveToLocalStorage]);

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
      // Create new manual item with stable UUID
      finalItem = normalizeGroceryItem({
        ...newItem,
        id: `manual-${uuidv4()}`,
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

  const deleteItem = useCallback((id: string) => {
    console.log("ShoppingListActions: deleteItem (permanent) called for id:", id);
    setAllItems(prev => prev.filter(i => i.id !== id));
    setManualItems(prev => prev.filter(i => i.id !== id));
    saveToLocalStorage();
    toast({
      title: "Item Deleted",
      description: "Item has been permanently removed from the list",
    });
  }, [setAllItems, setManualItems, saveToLocalStorage, toast]);

  const getCurrentItems = useCallback(() => allItems, [allItems]);

  return {
    updateItem,
    toggleItem,
    archiveItem,
    addItem,
    deleteItem,
    updateStores,
    resetList,
    getCurrentItems
  };
}
