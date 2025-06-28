
import { useState, useEffect } from "react";
import { GroceryItem, Meal } from "@/types";
import { generateShoppingList } from "@/utils/groceryUtils";
import { useShoppingListPersistence } from "./useShoppingListPersistence";

interface UseShoppingListSyncProps {
  meals: Meal[];
  pantryItems: string[];
}

export function useShoppingListSync({ meals, pantryItems }: UseShoppingListSyncProps) {
  // Core state
  const [allItems, setAllItems] = useState<GroceryItem[]>([]);
  const [manualItems, setManualItems] = useState<GroceryItem[]>([]);
  const [archivedItems, setArchivedItems] = useState<GroceryItem[]>([]);
  const [availableStores, setAvailableStores] = useState<string[]>(["Unassigned"]);

  // Persistence with store assignments
  const { storeAssignments, loadFromStorage, saveToLocalStorage } = useShoppingListPersistence(
    availableStores,
    archivedItems,
    allItems
  );

  // Load from storage on mount
  useEffect(() => {
    console.log("useShoppingListSync: Loading from storage on mount");
    const stored = loadFromStorage();
    
    if (stored.stores) {
      console.log("useShoppingListSync: Setting available stores from storage:", stored.stores);
      setAvailableStores(stored.stores);
    }
    
    if (stored.archived && Array.isArray(stored.archived)) {
      console.log("useShoppingListSync: Setting archived items from storage:", stored.archived.length);
      setArchivedItems(stored.archived);
    }
    
    if (stored.items && Array.isArray(stored.items)) {
      console.log("useShoppingListSync: Setting all items from storage:", stored.items.length);
      setAllItems(stored.items);
      
      // Filter manual items
      const manual = stored.items.filter(item => item.id.startsWith('manual-'));
      setManualItems(manual);
      console.log("useShoppingListSync: Found manual items:", manual.length);
    }
  }, [loadFromStorage]);

  // Generate shopping list from meals
  useEffect(() => {
    if (meals.length === 0) {
      console.log("useShoppingListSync: No meals, skipping generation");
      return;
    }

    console.log("useShoppingListSync: Generating shopping list from", meals.length, "meals");
    
    // Generate new items from meals
    const generatedItems = generateShoppingList(meals, pantryItems, allItems);
    
    // Apply store assignments from persistence
    const itemsWithStores = generatedItems.map(item => {
      const storedStore = storeAssignments.current.get(item.name.toLowerCase());
      if (storedStore) {
        console.log(`useShoppingListSync: Applying stored store "${storedStore}" to item "${item.name}"`);
        return { ...item, store: storedStore };
      }
      return item;
    });

    // Filter out items that already exist (preserve manual items and their updates)
    const existingIds = new Set(allItems.map(item => item.id));
    const newGeneratedItems = itemsWithStores.filter(item => !existingIds.has(item.id));
    
    if (newGeneratedItems.length > 0) {
      console.log("useShoppingListSync: Adding", newGeneratedItems.length, "new generated items");
      setAllItems(prev => [...prev.filter(item => !item.id.includes('-')), ...newGeneratedItems, ...manualItems]);
    }
  }, [meals, pantryItems, storeAssignments]);

  // Save when state changes
  useEffect(() => {
    saveToLocalStorage();
  }, [allItems, archivedItems, availableStores, saveToLocalStorage]);

  return {
    allItems,
    manualItems,
    archivedItems,
    availableStores,
    setAllItems,
    setManualItems,
    setArchivedItems,
    setAvailableStores,
    storeAssignments,
    saveToLocalStorage
  };
}
