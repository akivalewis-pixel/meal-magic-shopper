
import { useState, useEffect, useRef, useMemo } from "react";
import { GroceryItem, Meal } from "@/types";
import { generateShoppingList } from "@/utils/groceryUtils";
import { normalizeGroceryItem, sortGroceryItems } from "./utils";

interface UseShoppingListSyncProps {
  meals: Meal[];
  pantryItems: string[];
}

export function useShoppingListSync({ meals, pantryItems }: UseShoppingListSyncProps) {
  const [allItems, setAllItems] = useState<GroceryItem[]>([]);
  const [manualItems, setManualItems] = useState<GroceryItem[]>([]);
  const [archivedItems, setArchivedItems] = useState<GroceryItem[]>([]);
  const [availableStores, setAvailableStores] = useState<string[]>([
    "Unassigned", "Supermarket", "Farmers Market", "Specialty Store"
  ]);
  const [itemOverrides, setItemOverrides] = useState<Map<string, Partial<GroceryItem>>>(new Map());
  
  const isInitializedRef = useRef(false);
  const storeAssignments = useRef(new Map<string, string>());

  // Generate meal items with stable IDs and memoization
  const mealItems = useMemo(() => {
    const activeMeals = meals.filter(meal => meal.day && meal.day !== "");
    if (activeMeals.length === 0) return [];
    
    const items = generateShoppingList(activeMeals, pantryItems, []);
    return items.map(item => {
      const mealId = item.meal?.toLowerCase().replace(/\s+/g, '-') || 'default';
      const itemName = item.name.toLowerCase().replace(/\s+/g, '-');
      const stableId = `meal-${mealId}-${itemName}`;
      
      const storedStore = storeAssignments.current.get(item.name.toLowerCase());
      return normalizeGroceryItem({
        ...item,
        id: stableId,
        store: storedStore || "Unassigned",
        source: 'meal' as const
      });
    });
  }, [meals, pantryItems]);

  // Combine all items efficiently
  const combinedItems = useMemo(() => {
    const processedMealItems = mealItems.map(item => {
      const override = itemOverrides.get(item.id);
      return override ? { ...item, ...override } : item;
    });
    
    return sortGroceryItems([...processedMealItems, ...manualItems]);
  }, [mealItems, manualItems, itemOverrides]);

  // Load from localStorage on initialization
  useEffect(() => {
    if (isInitializedRef.current) return;
    
    try {
      const savedStores = localStorage.getItem('shoppingList_stores');
      const savedArchived = localStorage.getItem('shoppingList_archived');
      const savedItems = localStorage.getItem('shoppingList_allItems');
      const savedAssignments = localStorage.getItem('shoppingList_storeAssignments');
      
      if (savedStores) setAvailableStores(JSON.parse(savedStores));
      if (savedArchived) setArchivedItems(JSON.parse(savedArchived));
      if (savedItems) {
        const items = JSON.parse(savedItems);
        const manual = items.filter((item: GroceryItem) => item.id.startsWith('manual-'));
        setManualItems(manual);
        
        // Load overrides for meal items
        const overrides = new Map<string, Partial<GroceryItem>>();
        items.forEach((item: GroceryItem) => {
          if (item.id.includes('-') && !item.id.startsWith('manual-')) {
            overrides.set(item.id, item);
          }
        });
        setItemOverrides(overrides);
      }
      if (savedAssignments) {
        storeAssignments.current = new Map(JSON.parse(savedAssignments));
      }
      
      isInitializedRef.current = true;
    } catch (error) {
      console.warn('Failed to load from localStorage:', error);
      isInitializedRef.current = true;
    }
  }, []);

  // Update allItems when combinedItems change
  useEffect(() => {
    if (isInitializedRef.current) {
      setAllItems(combinedItems);
    }
  }, [combinedItems]);

  // Save to localStorage efficiently
  const saveToLocalStorage = () => {
    if (!isInitializedRef.current) return;
    
    try {
      localStorage.setItem('shoppingList_stores', JSON.stringify(availableStores));
      localStorage.setItem('shoppingList_archived', JSON.stringify(archivedItems));
      localStorage.setItem('shoppingList_allItems', JSON.stringify(allItems));
      localStorage.setItem('shoppingList_storeAssignments', 
        JSON.stringify(Array.from(storeAssignments.current.entries())));
    } catch (error) {
      console.warn('Failed to save to localStorage:', error);
    }
  };

  // Auto-save when data changes
  useEffect(() => {
    if (isInitializedRef.current) {
      saveToLocalStorage();
    }
  }, [availableStores, archivedItems, allItems]);

  return {
    allItems,
    manualItems,
    archivedItems,
    availableStores,
    setAllItems,
    setManualItems,
    setArchivedItems,
    setAvailableStores,
    setItemOverrides,
    storeAssignments,
    saveToLocalStorage,
    isInitialized: () => isInitializedRef.current
  };
}
