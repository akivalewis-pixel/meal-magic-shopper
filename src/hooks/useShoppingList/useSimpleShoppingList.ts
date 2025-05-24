
import { useEffect, useState, useMemo } from "react";
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

  // Combine meal items with manual items (memoized)
  const combinedItems = useMemo(() => {
    const manualItemNames = new Set(manualItems.map(item => item.name.toLowerCase()));
    
    // Filter out meal items that conflict with manual items
    const nonConflictingMealItems = mealItems.filter(item => 
      !manualItemNames.has(item.name.toLowerCase())
    );
    
    return [...nonConflictingMealItems, ...manualItems];
  }, [mealItems, manualItems]);

  const actions = useShoppingListActions({
    allItems: combinedItems,
    setAllItems: (items) => {
      if (typeof items === 'function') {
        const updatedItems = items(combinedItems);
        // Separate manual items from meal items
        const newManualItems = updatedItems.filter(item => item.id.startsWith('manual-'));
        setManualItems(newManualItems);
      } else {
        const newManualItems = items.filter(item => item.id.startsWith('manual-'));
        setManualItems(newManualItems);
      }
    },
    archivedItems,
    setArchivedItems,
    storeAssignments,
    saveToLocalStorage,
    setAvailableStores
  });

  // Load from localStorage on mount only
  useEffect(() => {
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
  }, []); // Empty dependency array - load only on mount

  // Update allItems when combinedItems change
  useEffect(() => {
    setAllItems(combinedItems);
  }, [combinedItems, setAllItems]);

  return {
    groceryItems: combinedItems,
    archivedItems,
    availableStores,
    ...actions
  };
}
