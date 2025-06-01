
import { useState, useEffect, useRef, useCallback } from "react";
import { Meal, GroceryItem } from "@/types";
import { generateShoppingList } from "@/utils/groceryUtils";

// Global state reference for print functionality
export const shoppingListStateRef = {
  currentItems: [] as GroceryItem[],
  availableStores: [] as string[]
};

export function useShoppingList(meals: Meal[], pantryItems: string[] = []) {
  const [groceryItems, setGroceryItems] = useState<GroceryItem[]>([]);
  const [archivedItems, setArchivedItems] = useState<GroceryItem[]>([]);
  const [availableStores, setAvailableStores] = useState<string[]>([
    "Unassigned", "Supermarket", "Farmers Market", "Specialty Store"
  ]);
  
  const isInitialized = useRef(false);
  const removedItemIds = useRef<Set<string>>(new Set());
  const storeAssignments = useRef<Map<string, string>>(new Map());

  // Load from localStorage on mount
  useEffect(() => {
    if (isInitialized.current) return;
    
    try {
      const savedItems = localStorage.getItem('shoppingList_items');
      const savedArchived = localStorage.getItem('shoppingList_archived');
      const savedStores = localStorage.getItem('shoppingList_stores');
      const savedAssignments = localStorage.getItem('shoppingList_storeAssignments');
      const savedRemovedIds = localStorage.getItem('shoppingList_removedIds');

      if (savedItems) {
        const items = JSON.parse(savedItems).filter((item: GroceryItem) => !item.checked);
        setGroceryItems(items);
      }
      if (savedArchived) {
        setArchivedItems(JSON.parse(savedArchived));
      }
      if (savedStores) {
        setAvailableStores(JSON.parse(savedStores));
      }
      if (savedAssignments) {
        storeAssignments.current = new Map(JSON.parse(savedAssignments));
      }
      if (savedRemovedIds) {
        removedItemIds.current = new Set(JSON.parse(savedRemovedIds));
      }

      isInitialized.current = true;
      console.log('ShoppingList: Data loaded from localStorage');
    } catch (error) {
      console.warn('Failed to load from localStorage:', error);
      isInitialized.current = true;
    }
  }, []);

  // Save to localStorage whenever data changes
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
      
      console.log('ShoppingList: Data saved to localStorage');
    } catch (error) {
      console.warn('Failed to save to localStorage:', error);
    }
  }, [groceryItems, archivedItems, availableStores]);

  // Auto-save and update global state
  useEffect(() => {
    if (isInitialized.current) {
      saveToStorage();
      // Update global state for print function
      const activeItems = groceryItems.filter(item => !item.checked && !removedItemIds.current.has(item.id));
      shoppingListStateRef.currentItems = [...activeItems];
      shoppingListStateRef.availableStores = [...availableStores];
    }
  }, [groceryItems, archivedItems, availableStores, saveToStorage]);

  // Generate items from meals
  useEffect(() => {
    if (!isInitialized.current || meals.length === 0) return;

    const mealItems = generateShoppingList(meals, pantryItems, groceryItems);
    const filteredMealItems = mealItems.filter(item => 
      !removedItemIds.current.has(item.id) && !item.checked
    );
    
    const enhancedItems = filteredMealItems.map(item => {
      const savedStore = storeAssignments.current.get(item.name.toLowerCase());
      return {
        ...item,
        store: savedStore || item.store || "Unassigned"
      };
    });

    setGroceryItems(prev => {
      const existingIds = new Set(prev.map(item => item.id));
      const newItems = enhancedItems.filter(item => !existingIds.has(item.id));
      
      if (newItems.length > 0) {
        const activeItems = prev.filter(item => !item.checked && !removedItemIds.current.has(item.id));
        return [...activeItems, ...newItems];
      }
      return prev.filter(item => !item.checked && !removedItemIds.current.has(item.id));
    });
  }, [meals, pantryItems]);

  // Action functions
  const updateItem = useCallback((updatedItem: GroceryItem) => {
    console.log("ShoppingList: Updating item", updatedItem.name);
    
    if (updatedItem.store && updatedItem.store !== "Unassigned") {
      storeAssignments.current.set(updatedItem.name.toLowerCase(), updatedItem.store);
    }

    if (updatedItem.checked) {
      toggleItem(updatedItem.id);
      return;
    }

    setGroceryItems(prev => 
      prev.map(item => 
        item.id === updatedItem.id 
          ? { ...updatedItem, __updateTimestamp: Date.now() }
          : item
      ).filter(item => !item.checked && !removedItemIds.current.has(item.id))
    );
  }, []);

  const toggleItem = useCallback((id: string) => {
    const item = groceryItems.find(i => i.id === id);
    if (!item) return;

    console.log("ShoppingList: Moving item to archived:", item.name);
    
    removedItemIds.current.add(id);
    const archivedItem = { ...item, checked: true, __updateTimestamp: Date.now() };
    
    setArchivedItems(prev => {
      const alreadyArchived = prev.some(archived => archived.id === id);
      if (alreadyArchived) return prev;
      return [...prev, archivedItem];
    });

    setGroceryItems(prev => prev.filter(i => i.id !== id));
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

  const updateStores = useCallback((stores: string[]) => {
    setAvailableStores(stores);
  }, []);

  const resetList = useCallback(() => {
    const itemsToArchive = groceryItems.map(item => ({ ...item, checked: true }));
    setArchivedItems(prev => [...prev, ...itemsToArchive]);
    groceryItems.forEach(item => removedItemIds.current.add(item.id));
    setGroceryItems([]);
  }, [groceryItems]);

  const getCurrentItems = useCallback(() => {
    const currentItems = shoppingListStateRef.currentItems.filter(item => 
      !item.checked && !removedItemIds.current.has(item.id)
    );
    console.log("getCurrentItems: Returning", currentItems.length, "current items");
    return currentItems;
  }, []);

  const getAvailableStores = useCallback(() => {
    return [...shoppingListStateRef.availableStores];
  }, []);

  const loadShoppingList = useCallback((items: GroceryItem[], stores: string[]) => {
    console.log("loadShoppingList: Loading", items.length, "items");
    updateStores(stores);
    removedItemIds.current.clear();
    setGroceryItems(items);
    shoppingListStateRef.currentItems = [...items];
    shoppingListStateRef.availableStores = [...stores];
  }, [updateStores]);

  // Return only active items (unchecked and not removed)
  const activeItems = groceryItems.filter(item => 
    !item.checked && !removedItemIds.current.has(item.id)
  );

  return {
    groceryItems: activeItems,
    archivedItems,
    availableStores,
    updateItem,
    toggleItem,
    archiveItem,
    addItem,
    updateStores,
    resetList,
    getCurrentItems,
    getAvailableStores,
    loadShoppingList
  };
}
