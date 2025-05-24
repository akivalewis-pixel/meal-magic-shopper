
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

  // Memoized combination of meal items with manual items
  const combinedItems = useMemo(() => {
    const manualItemNames = new Set(manualItems.map(item => item.name.toLowerCase()));
    
    // Filter out meal items that conflict with manual items
    const nonConflictingMealItems = mealItems.filter(item => 
      !manualItemNames.has(item.name.toLowerCase())
    );
    
    return [...nonConflictingMealItems, ...manualItems];
  }, [mealItems, manualItems]);

  // Debounced save function to prevent excessive localStorage writes
  const debouncedSave = useCallback(() => {
    const timeoutId = setTimeout(saveToLocalStorage, 300);
    return () => clearTimeout(timeoutId);
  }, [saveToLocalStorage]);

  const actions = useShoppingListActions({
    allItems: combinedItems,
    setAllItems: useCallback((items) => {
      if (typeof items === 'function') {
        const updatedItems = items(combinedItems);
        const newManualItems = updatedItems.filter(item => item.id.startsWith('manual-'));
        setManualItems(newManualItems);
      } else {
        const newManualItems = items.filter(item => item.id.startsWith('manual-'));
        setManualItems(newManualItems);
      }
      debouncedSave();
    }, [combinedItems, debouncedSave]),
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
  }, []); // Empty dependency array - load only on mount

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
