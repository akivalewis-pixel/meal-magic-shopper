
import { useState, useEffect, useRef } from "react";
import { GroceryItem, Meal } from "@/types";
import { useShoppingListPersistence } from "./useShoppingListPersistence";
import { useShoppingListGeneration } from "./useShoppingListGeneration";

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
  
  // Track initialization
  const isInitializedRef = useRef(false);
  const lastMealChangeRef = useRef<string>('');

  // Persistence with store assignments
  const { storeAssignments, loadFromStorage, saveToLocalStorage } = useShoppingListPersistence(
    availableStores,
    archivedItems,
    allItems
  );

  // Generate items from meals using the existing hook
  const generatedMealItems = useShoppingListGeneration(meals, pantryItems, storeAssignments);

  // Create meal change detection key
  const mealChangeKey = meals
    .filter(meal => meal.day && meal.day !== "")
    .map(meal => `${meal.id}-${meal.title}-${meal.day}-${meal.ingredients.join(',')}`)
    .sort()
    .join('|');

  // Load from storage on mount
  useEffect(() => {
    if (!isInitializedRef.current) {
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
        console.log("useShoppingListSync: Setting saved items from storage:", stored.items.length);
        
        // Filter manual items from saved items
        const savedManualItems = stored.items.filter(item => item.id.startsWith('manual-'));
        setManualItems(savedManualItems);
        console.log("useShoppingListSync: Found manual items:", savedManualItems.length);
      }
      
      isInitializedRef.current = true;
    }
  }, [loadFromStorage]);

  // Handle meal changes - regenerate when meals change significantly
  useEffect(() => {
    if (!isInitializedRef.current) {
      console.log("useShoppingListSync: Skipping meal update - not initialized");
      return;
    }

    console.log("useShoppingListSync: Checking meal changes");
    console.log("Previous meal key:", lastMealChangeRef.current);
    console.log("Current meal key:", mealChangeKey);
    
    if (mealChangeKey !== lastMealChangeRef.current) {
      console.log("useShoppingListSync: Meals changed, updating shopping list");
      console.log("Generated meal items:", generatedMealItems.length);
      
      // Combine generated items with manual items
      const combinedItems = [...generatedMealItems, ...manualItems];
      console.log("useShoppingListSync: Combined items:", combinedItems.length);
      
      setAllItems(combinedItems);
      lastMealChangeRef.current = mealChangeKey;
    }
  }, [mealChangeKey, generatedMealItems, manualItems]);

  // Save when state changes
  useEffect(() => {
    if (isInitializedRef.current) {
      console.log("useShoppingListSync: Saving to storage");
      saveToLocalStorage();
    }
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
