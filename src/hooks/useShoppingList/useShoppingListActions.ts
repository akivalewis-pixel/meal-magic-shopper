import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { GroceryItem } from "@/types";
import { sortGroceryItems, findMatchingArchivedItem, normalizeStoreValue } from "./utils";

interface UseShoppingListActionsProps {
  groceryItems: GroceryItem[];
  setGroceryItems: (items: GroceryItem[] | ((prev: GroceryItem[]) => GroceryItem[])) => void;
  archivedItems: GroceryItem[];
  setArchivedItems: (items: GroceryItem[] | ((prev: GroceryItem[]) => GroceryItem[])) => void;
  manualItems: GroceryItem[];
  setManualItems: (items: GroceryItem[] | ((prev: GroceryItem[]) => GroceryItem[])) => void;
  availableStores: string[];
  setAvailableStores: (stores: string[]) => void;
}

export const useShoppingListActions = ({
  groceryItems,
  setGroceryItems,
  archivedItems,
  setArchivedItems,
  manualItems,
  setManualItems,
  availableStores,
  setAvailableStores
}: UseShoppingListActionsProps) => {
  const { toast } = useToast();

  const handleToggleGroceryItem = (id: string) => {
    const updatedItems = groceryItems.map((item) =>
      item.id === id ? { ...item, checked: !item.checked } : item
    );
    setGroceryItems(updatedItems);
  };

  const handleUpdateGroceryItem = (updatedItem: GroceryItem) => {
    console.log("Updating single grocery item:", updatedItem);
    
    // Normalize the store value to ensure consistency
    const normalizedItem = {
      ...updatedItem,
      store: normalizeStoreValue(updatedItem.store)
    };
    
    console.log("Normalized item store value:", normalizedItem.store);
    
    // Update in groceryItems - this triggers resorting
    setGroceryItems(prevItems => {
      const newItems = prevItems.map(item =>
        item.id === normalizedItem.id ? normalizedItem : item
      );
      // Re-sort after update to ensure stores are properly grouped
      return sortGroceryItems(newItems);
    });
    
    // Update in manualItems if it exists there
    setManualItems(prevItems => {
      const existingIndex = prevItems.findIndex(item => item.id === normalizedItem.id);
      if (existingIndex >= 0) {
        const newItems = [...prevItems];
        newItems[existingIndex] = normalizedItem;
        return newItems;
      }
      return prevItems;
    });

    // If this is a store update, display a toast
    if (normalizedItem.store && normalizedItem.store !== "Unassigned") {
      toast({
        title: "Store Updated",
        description: `${normalizedItem.name} assigned to ${normalizedItem.store}`,
      });
    }
  };

  const handleUpdateMultipleGroceryItems = (items: GroceryItem[], updates: Partial<GroceryItem>) => {
    console.log("Updating multiple grocery items:", items.length, "with updates:", updates);
    
    // Normalize store value if present
    const normalizedUpdates = { ...updates };
    if (normalizedUpdates.store !== undefined) {
      normalizedUpdates.store = normalizeStoreValue(normalizedUpdates.store);
      console.log("Normalized bulk update store value:", normalizedUpdates.store);
    }
    
    // Create a map of item IDs to updates for efficient lookup
    const itemIdsToUpdate = new Set(items.map(item => item.id));
    
    // Update groceryItems with proper state management
    setGroceryItems(prevItems => {
      console.log("Previous items count:", prevItems.length);
      const newItems = prevItems.map(item => {
        if (itemIdsToUpdate.has(item.id)) {
          const updatedItem = { ...item, ...normalizedUpdates };
          console.log("Updating item:", item.name, "from store:", item.store, "to store:", updatedItem.store);
          return updatedItem;
        }
        return item;
      });
      // Re-sort after bulk update to ensure proper grouping
      const sortedItems = sortGroceryItems(newItems);
      console.log("After bulk update and sort, items count:", sortedItems.length);
      return sortedItems;
    });
    
    // Update manualItems if any of the updated items exist there
    setManualItems(prevItems => {
      const newItems = prevItems.map(item => {
        if (itemIdsToUpdate.has(item.id)) {
          return { ...item, ...normalizedUpdates };
        }
        return item;
      });
      return newItems;
    });

    // Show success toast
    const updateType = normalizedUpdates.store ? 'store' : normalizedUpdates.category ? 'category' : 'items';
    const updateValue = normalizedUpdates.store || normalizedUpdates.category || 'updated';
    toast({
      title: "Items Updated",
      description: `${items.length} item${items.length > 1 ? 's' : ''} moved to ${updateValue}`,
    });
  };

  const handleUpdateStores = (stores: string[]) => {
    setAvailableStores(stores);
    toast({
      title: "Stores Updated",
      description: `Your store list has been updated`,
    });
  };
  
  const handleAddGroceryItem = (newItem: GroceryItem) => {
    // Check if this item was previously archived
    const matchingArchivedItem = findMatchingArchivedItem(newItem, archivedItems);

    if (matchingArchivedItem) {
      // Remove from archived items
      setArchivedItems(prev => 
        prev.filter(item => item.id !== matchingArchivedItem.id)
      );
      
      // Use some properties from the archived item
      newItem.category = matchingArchivedItem.category;
      if (matchingArchivedItem.store) newItem.store = matchingArchivedItem.store;
    }
    
    // Normalize store value
    newItem.store = normalizeStoreValue(newItem.store);
    
    // Add to manual items
    setManualItems(prev => [...prev, newItem]);
    
    // Add to grocery items directly to ensure immediate visibility
    setGroceryItems(prevItems => sortGroceryItems([...prevItems, newItem]));
    
    toast({
      title: "Item Added",
      description: `${newItem.name} has been added to your shopping list`,
    });
  };
  
  const handleArchiveItem = (id: string) => {
    const itemToArchive = groceryItems.find(item => item.id === id);
    if (!itemToArchive) return;
    
    // Add the item to the archive with checked state
    setArchivedItems(prev => [...prev, {...itemToArchive, checked: true}]);
    
    // Remove the item from the current list
    setGroceryItems(prev => prev.filter(item => item.id !== id));
    
    // Remove from manual items if it exists there
    setManualItems(prev => prev.filter(item => item.id !== id));
    
    toast({
      title: "Item Archived",
      description: `${itemToArchive.name} has been moved to archive`,
    });
  };

  const resetShoppingList = () => {
    setManualItems([]);
    
    toast({
      title: "Shopping List Reset",
      description: "Your shopping list has been reset.",
    });
  };

  return {
    handleToggleGroceryItem,
    handleUpdateGroceryItem,
    handleUpdateMultipleGroceryItems,
    handleUpdateStores,
    handleAddGroceryItem,
    handleArchiveItem,
    resetShoppingList
  };
};
