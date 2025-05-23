import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { GroceryItem } from "@/types";
import { sortGroceryItems, findMatchingArchivedItem, normalizeStoreValue, normalizeGroceryItem } from "./utils";

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
    console.log("useShoppingListActions - Updating single item:", updatedItem.name, "to store:", updatedItem.store);
    
    // Normalize the entire item to ensure consistency
    const normalizedItem = normalizeGroceryItem(updatedItem);
    
    console.log("useShoppingListActions - Normalized item store:", normalizedItem.store);
    
    // Force a complete state update to ensure re-render
    setGroceryItems(prevItems => {
      const newItems = prevItems.map(item =>
        item.id === normalizedItem.id ? { ...normalizedItem } : item
      );
      const sortedItems = sortGroceryItems(newItems);
      console.log("useShoppingListActions - After single update, updated item in list:", 
        sortedItems.find(item => item.id === normalizedItem.id));
      return sortedItems;
    });
    
    // Update in manualItems if it exists there
    setManualItems(prevItems => {
      const existingIndex = prevItems.findIndex(item => item.id === normalizedItem.id);
      if (existingIndex >= 0) {
        const newItems = [...prevItems];
        newItems[existingIndex] = { ...normalizedItem };
        return newItems;
      }
      return prevItems;
    });

    // Show toast for store updates
    if (normalizedItem.store && normalizedItem.store !== "Unassigned") {
      toast({
        title: "Store Updated",
        description: `${normalizedItem.name} assigned to ${normalizedItem.store}`,
      });
    } else {
      toast({
        title: "Store Updated", 
        description: `${normalizedItem.name} moved to Unassigned`,
      });
    }
  };

  const handleUpdateMultipleGroceryItems = (items: GroceryItem[], updates: Partial<GroceryItem>) => {
    console.log("useShoppingListActions - Bulk update:", items.length, "items with:", updates);
    
    // Normalize updates
    const normalizedUpdates = { ...updates };
    if (normalizedUpdates.store !== undefined) {
      normalizedUpdates.store = normalizeStoreValue(normalizedUpdates.store);
      console.log("useShoppingListActions - Normalized bulk store value:", normalizedUpdates.store);
    }
    
    const itemIdsToUpdate = new Set(items.map(item => item.id));
    
    // Force a complete state update to ensure re-render
    setGroceryItems(prevItems => {
      const newItems = prevItems.map(item => {
        if (itemIdsToUpdate.has(item.id)) {
          const updatedItem = normalizeGroceryItem({ ...item, ...normalizedUpdates });
          console.log("useShoppingListActions - Bulk updating:", item.name, "from:", item.store, "to:", updatedItem.store);
          return { ...updatedItem };
        }
        return item;
      });
      
      const sortedItems = sortGroceryItems(newItems);
      console.log("useShoppingListActions - After bulk update, sample updated items:", 
        sortedItems.filter(item => itemIdsToUpdate.has(item.id)).slice(0, 3).map(item => ({ name: item.name, store: item.store })));
      return sortedItems;
    });
    
    // Update manualItems if any of the updated items exist there
    setManualItems(prevItems => {
      const newItems = prevItems.map(item => {
        if (itemIdsToUpdate.has(item.id)) {
          return normalizeGroceryItem({ ...item, ...normalizedUpdates });
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
    
    // Normalize the new item
    const normalizedItem = normalizeGroceryItem(newItem);
    
    // Add to manual items
    setManualItems(prev => [...prev, normalizedItem]);
    
    // Add to grocery items directly to ensure immediate visibility
    setGroceryItems(prevItems => sortGroceryItems([...prevItems, normalizedItem]));
    
    toast({
      title: "Item Added",
      description: `${normalizedItem.name} has been added to your shopping list`,
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
