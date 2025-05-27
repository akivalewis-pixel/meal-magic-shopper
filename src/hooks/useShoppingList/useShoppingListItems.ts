
import { useState, useEffect, useCallback } from "react";
import { GroceryItem, Meal } from "@/types";
import { generateShoppingList } from "@/utils/groceryUtils";

interface UseShoppingListItemsProps {
  meals: Meal[];
  pantryItems: string[];
  isInitialized: React.MutableRefObject<boolean>;
  removedItemIds: React.MutableRefObject<Set<string>>;
  storeAssignments: React.MutableRefObject<Map<string, string>>;
  saveToStorage: (groceryItems: GroceryItem[], archivedItems: GroceryItem[], availableStores: string[]) => void;
  initialItems: GroceryItem[];
  initialArchived: GroceryItem[];
}

export function useShoppingListItems({
  meals,
  pantryItems,
  isInitialized,
  removedItemIds,
  storeAssignments,
  saveToStorage,
  initialItems,
  initialArchived
}: UseShoppingListItemsProps) {
  const [groceryItems, setGroceryItems] = useState<GroceryItem[]>(initialItems);
  const [archivedItems, setArchivedItems] = useState<GroceryItem[]>(initialArchived);

  // Generate items from meals
  useEffect(() => {
    if (!isInitialized.current || meals.length === 0) return;

    const mealItems = generateShoppingList(meals, pantryItems, groceryItems);
    
    // Filter out items that have been manually removed/archived
    const filteredMealItems = mealItems.filter(item => 
      !removedItemIds.current.has(item.id) && !item.checked
    );
    
    // Apply store assignments
    const enhancedItems = filteredMealItems.map(item => {
      const savedStore = storeAssignments.current.get(item.name.toLowerCase());
      return {
        ...item,
        store: savedStore || item.store || "Unassigned"
      };
    });

    // Only update if there are actual changes
    setGroceryItems(prev => {
      const existingIds = new Set(prev.map(item => item.id));
      const newItems = enhancedItems.filter(item => !existingIds.has(item.id));
      
      if (newItems.length > 0) {
        const activeItems = prev.filter(item => !item.checked && !removedItemIds.current.has(item.id));
        return [...activeItems, ...newItems];
      }
      // Always filter out checked items and removed items
      return prev.filter(item => !item.checked && !removedItemIds.current.has(item.id));
    });
  }, [meals, pantryItems, isInitialized.current]);

  const updateItem = useCallback((updatedItem: GroceryItem) => {
    console.log("ShoppingListItems: Updating item", updatedItem.name, "checked:", updatedItem.checked);
    console.log("ShoppingListItems: Item details - store:", updatedItem.store, "quantity:", updatedItem.quantity, "category:", updatedItem.category);
    
    // Update store assignment for persistence
    if (updatedItem.store && updatedItem.store !== "Unassigned") {
      storeAssignments.current.set(updatedItem.name.toLowerCase(), updatedItem.store);
      console.log("ShoppingListItems: Store assignment saved for", updatedItem.name, "->", updatedItem.store);
    }

    // If item is being checked, use toggleItem instead
    if (updatedItem.checked) {
      console.log("ShoppingListItems: Item is checked, using toggleItem instead");
      toggleItem(updatedItem.id);
      return;
    }

    // Regular update for unchecked items - ensure all properties are updated
    setGroceryItems(prev => {
      const updated = prev.map(item => 
        item.id === updatedItem.id 
          ? { 
              ...updatedItem, 
              __updateTimestamp: Date.now(),
              // Ensure all user modifications are preserved
              name: updatedItem.name,
              quantity: updatedItem.quantity,
              store: updatedItem.store || "Unassigned",
              category: updatedItem.category
            }
          : item
      ).filter(item => !item.checked && !removedItemIds.current.has(item.id));
      
      console.log("ShoppingListItems: Updated items count:", updated.length);
      return updated;
    });
  }, []);

  const toggleItem = useCallback((id: string) => {
    console.log("ShoppingListItems: Toggling item with ID:", id);
    
    // Find the item first
    const item = groceryItems.find(i => i.id === id);
    if (!item) {
      console.log("ShoppingListItems: Item not found:", id);
      return;
    }

    console.log("ShoppingListItems: Moving item to archived:", item.name);
    
    // Add to removed items set to prevent it from being re-added
    removedItemIds.current.add(id);
    
    // Create archived item
    const archivedItem = { ...item, checked: true, __updateTimestamp: Date.now() };
    
    // Add to archived items (check for duplicates)
    setArchivedItems(prevArchived => {
      const alreadyArchived = prevArchived.some(archived => archived.id === id);
      if (alreadyArchived) {
        console.log("ShoppingListItems: Item already archived:", id);
        return prevArchived;
      }
      console.log("ShoppingListItems: Adding to archive:", item.name);
      return [...prevArchived, archivedItem];
    });

    // Remove from main list immediately
    setGroceryItems(prev => {
      const updatedList = prev.filter(i => i.id !== id);
      console.log("ShoppingListItems: Removed from main list, remaining items:", updatedList.length);
      return updatedList;
    });
  }, [groceryItems]);

  const addItem = useCallback((newItem: Omit<GroceryItem, 'id' | 'checked'>) => {
    const item: GroceryItem = {
      ...newItem,
      id: `manual-${newItem.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
      checked: false,
      store: newItem.store || "Unassigned"
    };

    setGroceryItems(prev => [...prev.filter(item => !item.checked), item]);
  }, []);

  const archiveItem = useCallback((id: string) => {
    const item = archivedItems.find(i => i.id === id);
    if (!item) return;

    setArchivedItems(prev => prev.filter(i => i.id !== id));
    removedItemIds.current.delete(id);
  }, [archivedItems]);

  const resetList = useCallback(() => {
    const itemsToArchive = groceryItems.map(item => ({ ...item, checked: true }));
    setArchivedItems(prev => [...prev, ...itemsToArchive]);
    
    // Add all current item IDs to removed set
    groceryItems.forEach(item => {
      removedItemIds.current.add(item.id);
    });
    
    setGroceryItems([]);
  }, [groceryItems]);

  return {
    groceryItems,
    archivedItems,
    setGroceryItems,
    setArchivedItems,
    updateItem,
    toggleItem,
    addItem,
    archiveItem,
    resetList
  };
}
