
import { useState, useEffect, useRef, useCallback } from "react";
import { GroceryItem, Meal } from "@/types";
import { generateShoppingList } from "@/utils/groceryUtils";

export function useSimplifiedShoppingList(meals: Meal[], pantryItems: string[] = []) {
  const [groceryItems, setGroceryItems] = useState<GroceryItem[]>([]);
  const [archivedItems, setArchivedItems] = useState<GroceryItem[]>([]);
  const [availableStores, setAvailableStores] = useState<string[]>([
    "Unassigned", "Supermarket", "Farmers Market", "Specialty Store"
  ]);
  
  const storeAssignments = useRef<Map<string, string>>(new Map());
  const isInitialized = useRef(false);
  const removedItemIds = useRef<Set<string>>(new Set());

  // Load from localStorage on mount
  useEffect(() => {
    if (!isInitialized.current) {
      try {
        const savedItems = localStorage.getItem('shoppingList_items');
        const savedArchived = localStorage.getItem('shoppingList_archived');
        const savedStores = localStorage.getItem('shoppingList_stores');
        const savedAssignments = localStorage.getItem('shoppingList_storeAssignments');
        const savedRemovedIds = localStorage.getItem('shoppingList_removedIds');

        if (savedItems) {
          const items = JSON.parse(savedItems);
          setGroceryItems(items.filter((item: GroceryItem) => !item.checked));
        }
        if (savedArchived) setArchivedItems(JSON.parse(savedArchived));
        if (savedStores) setAvailableStores(JSON.parse(savedStores));
        if (savedAssignments) {
          storeAssignments.current = new Map(JSON.parse(savedAssignments));
        }
        if (savedRemovedIds) {
          removedItemIds.current = new Set(JSON.parse(savedRemovedIds));
        }

        isInitialized.current = true;
      } catch (error) {
        console.warn('Failed to load from localStorage:', error);
        isInitialized.current = true;
      }
    }
  }, []);

  // Save to localStorage
  const saveToStorage = useCallback(() => {
    if (!isInitialized.current) return;
    
    try {
      const activeItems = groceryItems.filter(item => !item.checked);
      localStorage.setItem('shoppingList_items', JSON.stringify(activeItems));
      localStorage.setItem('shoppingList_archived', JSON.stringify(archivedItems));
      localStorage.setItem('shoppingList_stores', JSON.stringify(availableStores));
      localStorage.setItem('shoppingList_storeAssignments', 
        JSON.stringify(Array.from(storeAssignments.current.entries())));
      localStorage.setItem('shoppingList_removedIds', 
        JSON.stringify(Array.from(removedItemIds.current)));
    } catch (error) {
      console.warn('Failed to save to localStorage:', error);
    }
  }, [groceryItems, archivedItems, availableStores]);

  // Auto-save when data changes
  useEffect(() => {
    saveToStorage();
  }, [saveToStorage]);

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

  // Actions
  const updateItem = useCallback((updatedItem: GroceryItem) => {
    console.log("SimplifiedShoppingList: Updating item", updatedItem.name, "checked:", updatedItem.checked);
    
    // Update store assignment
    if (updatedItem.store && updatedItem.store !== "Unassigned") {
      storeAssignments.current.set(updatedItem.name.toLowerCase(), updatedItem.store);
    }

    // If item is being checked, use toggleItem instead
    if (updatedItem.checked) {
      console.log("SimplifiedShoppingList: Item is checked, using toggleItem instead");
      toggleItem(updatedItem.id);
      return;
    }

    // Regular update for unchecked items only
    setGroceryItems(prev => 
      prev.map(item => 
        item.id === updatedItem.id 
          ? { ...updatedItem, __updateTimestamp: Date.now() }
          : item
      ).filter(item => !item.checked && !removedItemIds.current.has(item.id))
    );
  }, []);

  const toggleItem = useCallback((id: string) => {
    console.log("SimplifiedShoppingList: Toggling item with ID:", id);
    
    // Find the item first
    const item = groceryItems.find(i => i.id === id);
    if (!item) {
      console.log("SimplifiedShoppingList: Item not found:", id);
      return;
    }

    console.log("SimplifiedShoppingList: Moving item to archived:", item.name);
    
    // Add to removed items set to prevent it from being re-added
    removedItemIds.current.add(id);
    
    // Create archived item
    const archivedItem = { ...item, checked: true, __updateTimestamp: Date.now() };
    
    // Add to archived items (check for duplicates)
    setArchivedItems(prevArchived => {
      const alreadyArchived = prevArchived.some(archived => archived.id === id);
      if (alreadyArchived) {
        console.log("SimplifiedShoppingList: Item already archived:", id);
        return prevArchived;
      }
      console.log("SimplifiedShoppingList: Adding to archive:", item.name);
      return [...prevArchived, archivedItem];
    });

    // Remove from main list immediately
    setGroceryItems(prev => {
      const updatedList = prev.filter(i => i.id !== id);
      console.log("SimplifiedShoppingList: Removed from main list, remaining items:", updatedList.length);
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

  const updateStores = useCallback((stores: string[]) => {
    setAvailableStores(stores);
  }, []);

  // Always return only unchecked items that haven't been removed
  const activeGroceryItems = groceryItems.filter(item => 
    !item.checked && !removedItemIds.current.has(item.id)
  );

  console.log("SimplifiedShoppingList: Returning", activeGroceryItems.length, "active items");

  return {
    groceryItems: activeGroceryItems,
    archivedItems,
    availableStores,
    updateItem,
    toggleItem,
    archiveItem,
    addItem,
    updateStores,
    resetList
  };
}
