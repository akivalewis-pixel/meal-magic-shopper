
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
    console.log("ShoppingListActions: toggleItem called for id:", id);
    const item = allItems.find(i => i.id === id);
    if (!item) {
      console.log("ShoppingListActions: Item not found for id:", id);
      return;
    }

    console.log("ShoppingListActions: Found item to archive:", item.name);

    // Archive the item — keep original ID for stable DB identity
    const archivedItem = { 
      ...item, 
      checked: true,
      __updateTimestamp: Date.now()
    };
    
    // Update all states in the correct order
    console.log("ShoppingListActions: Adding to archive and removing from active lists");
    
    // Add to archived items first
    setArchivedItems(prev => [archivedItem, ...prev]);
    
    // Remove from main list immediately
    setAllItems(prev => {
      const filtered = prev.filter(i => i.id !== id);
      console.log("ShoppingListActions: Filtered allItems from", prev.length, "to", filtered.length);
      return filtered;
    });
    
    // Remove from manual items if applicable
    if (item.id.startsWith('manual-')) {
      setManualItems(prev => {
        const filtered = prev.filter(i => i.id !== id);
        console.log("ShoppingListActions: Filtered manualItems from", prev.length, "to", filtered.length);
        return filtered;
      });
    }
    
    // Save immediately
    setTimeout(() => saveToLocalStorage(), 0);
    
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
