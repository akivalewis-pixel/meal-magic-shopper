
import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { Meal, GroceryItem } from "@/types";
import { useShoppingListState } from "./useShoppingListState";
import { useShoppingListPersistence } from "./useShoppingListPersistence";
import { useShoppingListGeneration } from "./useShoppingListGeneration";
import { useShoppingListActions } from "./useShoppingListActions";

export function useSimpleShoppingList(meals: Meal[], pantryItems: string[] = []) {
  const {
    allItems,
    setAllItems,
    archivedItems,
    setArchivedItems,
    availableStores,
    setAvailableStores
  } = useShoppingListState();

  const [manualItems, setManualItems] = useState<GroceryItem[]>([]);
  const isInitializedRef = useRef(false);

  const {
    storeAssignments,
    loadFromStorage,
    saveToLocalStorage
  } = useShoppingListPersistence(availableStores, archivedItems, allItems);

  const mealItems = useShoppingListGeneration(
    meals,
    pantryItems,
    storeAssignments
  );

  // Apply store assignments to meal items and combine with manual items
  const combinedItems = useMemo(() => {
    const manualItemNames = new Set(manualItems.map(item => item.name.toLowerCase()));
    
    // Filter out meal items that conflict with manual items, and apply store assignments
    const enhancedMealItems = mealItems
      .filter(item => !manualItemNames.has(item.name.toLowerCase()))
      .map(item => {
        const savedStore = storeAssignments.current.get(item.name.toLowerCase());
        return {
          ...item,
          store: savedStore || item.store || "Unassigned"
        };
      });
    
    return [...enhancedMealItems, ...manualItems];
  }, [mealItems, manualItems, storeAssignments]);

  // Enhanced update function that handles meal-to-manual conversion
  const updateItem = useCallback((updatedItem: GroceryItem) => {
    console.log("useSimpleShoppingList: Updating item", updatedItem.name, "with store", updatedItem.store);
    
    // Update store assignment immediately
    if (updatedItem.store && updatedItem.store !== "Unassigned") {
      storeAssignments.current.set(updatedItem.name.toLowerCase(), updatedItem.store);
    } else if (updatedItem.store === "Unassigned") {
      storeAssignments.current.delete(updatedItem.name.toLowerCase());
    }

    // Check if this is a meal item being edited
    const isMealItem = updatedItem.id.includes('-') && !updatedItem.id.startsWith('manual-');
    
    if (isMealItem) {
      console.log("useSimpleShoppingList: Converting meal item to manual item:", updatedItem.name);
      
      // Create a new manual item to override the meal item
      const manualItem = {
        ...updatedItem,
        id: `manual-${updatedItem.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
        __updateTimestamp: Date.now()
      };
      
      setManualItems(prev => {
        // Remove any existing manual item with the same name
        const filtered = prev.filter(item => 
          item.name.toLowerCase() !== updatedItem.name.toLowerCase()
        );
        return [...filtered, manualItem];
      });
    } else {
      // Update existing manual item
      setManualItems(prev => 
        prev.map(item => 
          item.id === updatedItem.id 
            ? { ...updatedItem, __updateTimestamp: Date.now() }
            : item
        )
      );
    }

    // Save changes
    setTimeout(saveToLocalStorage, 100);
  }, [storeAssignments, setManualItems, saveToLocalStorage]);

  // Simplified save function
  const debouncedSave = useCallback(() => {
    const timeoutId = setTimeout(() => {
      if (isInitializedRef.current) {
        saveToLocalStorage();
      }
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [saveToLocalStorage]);

  // Enhanced setAllItems callback that handles manual items properly
  const handleSetAllItems = useCallback((items: GroceryItem[] | ((prev: GroceryItem[]) => GroceryItem[])) => {
    let updatedItems: GroceryItem[];
    
    if (typeof items === 'function') {
      updatedItems = items(combinedItems);
    } else {
      updatedItems = items;
    }
    
    // Update only manual items
    const newManualItems = updatedItems.filter(item => item.id.startsWith('manual-'));
    setManualItems(newManualItems);
    debouncedSave();
  }, [combinedItems, debouncedSave]);

  const actions = useShoppingListActions({
    allItems: combinedItems,
    setAllItems: handleSetAllItems,
    archivedItems,
    setArchivedItems,
    storeAssignments,
    saveToLocalStorage: debouncedSave,
    setAvailableStores
  });

  // Load from localStorage on mount and apply store assignments
  useEffect(() => {
    if (!isInitializedRef.current) {
      const savedData = loadFromStorage();
      
      if (savedData.stores) {
        setAvailableStores(savedData.stores);
      }
      if (savedData.archived) {
        setArchivedItems(savedData.archived);
      }
      if (savedData.items) {
        const savedManualItems = savedData.items.filter(item => item.id.startsWith('manual-'));
        setManualItems(savedManualItems);
      }
      
      console.log("useSimpleShoppingList: Loaded store assignments:", Object.fromEntries(storeAssignments.current));
      isInitializedRef.current = true;
    }
  }, [loadFromStorage, setAvailableStores, setArchivedItems]);

  // Update allItems when combinedItems change and we're initialized
  useEffect(() => {
    if (isInitializedRef.current) {
      setAllItems(combinedItems);
    }
  }, [combinedItems, setAllItems]);

  return {
    groceryItems: combinedItems,
    archivedItems,
    availableStores,
    updateItem,
    ...actions
  };
}
