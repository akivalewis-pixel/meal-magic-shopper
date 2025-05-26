
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

  // Load from localStorage on mount
  useEffect(() => {
    if (!isInitialized.current) {
      try {
        const savedItems = localStorage.getItem('shoppingList_items');
        const savedArchived = localStorage.getItem('shoppingList_archived');
        const savedStores = localStorage.getItem('shoppingList_stores');
        const savedAssignments = localStorage.getItem('shoppingList_storeAssignments');

        if (savedItems) {
          const items = JSON.parse(savedItems);
          // Filter out any checked items that might have been saved incorrectly
          setGroceryItems(items.filter((item: GroceryItem) => !item.checked));
        }
        if (savedArchived) setArchivedItems(JSON.parse(savedArchived));
        if (savedStores) setAvailableStores(JSON.parse(savedStores));
        if (savedAssignments) {
          storeAssignments.current = new Map(JSON.parse(savedAssignments));
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
      // Ensure we only save unchecked items to the main list
      const activeItems = groceryItems.filter(item => !item.checked);
      localStorage.setItem('shoppingList_items', JSON.stringify(activeItems));
      localStorage.setItem('shoppingList_archived', JSON.stringify(archivedItems));
      localStorage.setItem('shoppingList_stores', JSON.stringify(availableStores));
      localStorage.setItem('shoppingList_storeAssignments', 
        JSON.stringify(Array.from(storeAssignments.current.entries())));
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
    
    // Apply store assignments
    const enhancedItems = mealItems.map(item => {
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
        // Ensure we're only adding unchecked items
        const activeNewItems = newItems.filter(item => !item.checked);
        return [...prev.filter(item => !item.checked), ...activeNewItems];
      }
      // Always filter out checked items from the main list
      return prev.filter(item => !item.checked);
    });
  }, [meals, pantryItems, isInitialized.current]);

  // Actions
  const updateItem = useCallback((updatedItem: GroceryItem) => {
    console.log("SimplifiedShoppingList: Updating item", updatedItem.name);
    
    // Update store assignment
    if (updatedItem.store && updatedItem.store !== "Unassigned") {
      storeAssignments.current.set(updatedItem.name.toLowerCase(), updatedItem.store);
    }

    // If the item is being checked, move it to archived instead of updating
    if (updatedItem.checked) {
      const item = groceryItems.find(i => i.id === updatedItem.id);
      if (item) {
        setArchivedItems(prev => [...prev, { ...updatedItem, checked: true }]);
        setGroceryItems(prev => prev.filter(i => i.id !== updatedItem.id));
      }
    } else {
      setGroceryItems(prev => 
        prev.map(item => 
          item.id === updatedItem.id 
            ? { ...updatedItem, __updateTimestamp: Date.now() }
            : item
        )
      );
    }
  }, [groceryItems]);

  const toggleItem = useCallback((id: string) => {
    const item = groceryItems.find(i => i.id === id);
    if (!item) return;

    console.log("SimplifiedShoppingList: Toggling item", item.name);
    
    // Move to archived
    setArchivedItems(prev => [...prev, { ...item, checked: true }]);
    setGroceryItems(prev => prev.filter(i => i.id !== id));
  }, [groceryItems]);

  const addItem = useCallback((newItem: Omit<GroceryItem, 'id' | 'checked'>) => {
    const item: GroceryItem = {
      ...newItem,
      id: `manual-${newItem.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
      checked: false,
      store: newItem.store || "Unassigned"
    };

    setGroceryItems(prev => [...prev, item]);
  }, []);

  const archiveItem = useCallback((id: string) => {
    const item = archivedItems.find(i => i.id === id);
    if (!item) return;

    setArchivedItems(prev => prev.filter(i => i.id !== id));
  }, [archivedItems]);

  const resetList = useCallback(() => {
    setArchivedItems(prev => [...prev, ...groceryItems.map(item => ({ ...item, checked: true }))]);
    setGroceryItems([]);
  }, [groceryItems]);

  const updateStores = useCallback((stores: string[]) => {
    setAvailableStores(stores);
  }, []);

  // Ensure groceryItems never contains checked items
  const activeGroceryItems = groceryItems.filter(item => !item.checked);

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
