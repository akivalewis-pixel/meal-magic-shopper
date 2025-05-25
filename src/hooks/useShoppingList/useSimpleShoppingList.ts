
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

  // Simplified combination of meal items with manual items
  const combinedItems = useMemo(() => {
    const manualItemNames = new Set(manualItems.map(item => item.name.toLowerCase()));
    
    // Filter out meal items that conflict with manual items
    const nonConflictingMealItems = mealItems.filter(item => 
      !manualItemNames.has(item.name.toLowerCase())
    );
    
    return [...nonConflictingMealItems, ...manualItems];
  }, [mealItems, manualItems]);

  // Simplified save function
  const debouncedSave = useCallback(() => {
    const timeoutId = setTimeout(() => {
      if (isInitializedRef.current) {
        saveToLocalStorage();
      }
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [saveToLocalStorage]);

  // Simplified setAllItems callback
  const handleSetAllItems = useCallback((items: GroceryItem[] | ((prev: GroceryItem[]) => GroceryItem[])) => {
    let updatedItems: GroceryItem[];
    
    if (typeof items === 'function') {
      updatedItems = items(combinedItems);
    } else {
      updatedItems = items;
    }
    
    // Only update manual items
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

  // Load from localStorage on mount only
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
      
      isInitializedRef.current = true;
    }
  }, [loadFromStorage, setAvailableStores, setArchivedItems]);

  // Update allItems only when combinedItems change and we're initialized
  useEffect(() => {
    if (isInitializedRef.current) {
      setAllItems(combinedItems);
    }
  }, [combinedItems, setAllItems]);

  return {
    groceryItems: combinedItems,
    archivedItems,
    availableStores,
    ...actions
  };
}
