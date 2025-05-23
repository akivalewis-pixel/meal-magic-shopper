
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { GroceryItem } from "@/types";
import { sortGroceryItems, findMatchingArchivedItem } from "./utils";

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
    console.log("Updating grocery item:", updatedItem);
    
    // Update in groceryItems - this triggers resorting
    setGroceryItems(prevItems => {
      const newItems = prevItems.map(item =>
        item.id === updatedItem.id ? updatedItem : item
      );
      // Re-sort after update to ensure stores are properly grouped
      return sortGroceryItems(newItems);
    });
    
    // Update in manualItems if it exists there
    setManualItems(prevItems => {
      const existingIndex = prevItems.findIndex(item => item.id === updatedItem.id);
      if (existingIndex >= 0) {
        const newItems = [...prevItems];
        newItems[existingIndex] = updatedItem;
        return newItems;
      }
      return prevItems;
    });

    // If this is a store update, display a toast
    if (updatedItem.store) {
      toast({
        title: "Store Updated",
        description: `${updatedItem.name} assigned to ${updatedItem.store}`,
      });
    }
  };

  const handleUpdateMultipleGroceryItems = (items: GroceryItem[], updates: Partial<GroceryItem>) => {
    console.log("Updating multiple grocery items:", items.length, "with updates:", updates);
    
    // Create a map of item IDs to updates for efficient lookup
    const itemIdsToUpdate = new Set(items.map(item => item.id));
    
    // Update groceryItems
    setGroceryItems(prevItems => {
      const newItems = prevItems.map(item => {
        if (itemIdsToUpdate.has(item.id)) {
          return { ...item, ...updates };
        }
        return item;
      });
      // Re-sort after bulk update
      return sortGroceryItems(newItems);
    });
    
    // Update manualItems if any of the updated items exist there
    setManualItems(prevItems => {
      const newItems = prevItems.map(item => {
        if (itemIdsToUpdate.has(item.id)) {
          return { ...item, ...updates };
        }
        return item;
      });
      return newItems;
    });

    // Show success toast
    const updateType = updates.store ? 'store' : updates.category ? 'category' : 'items';
    toast({
      title: "Items Updated",
      description: `${items.length} item${items.length > 1 ? 's' : ''} ${updateType} updated successfully`,
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
