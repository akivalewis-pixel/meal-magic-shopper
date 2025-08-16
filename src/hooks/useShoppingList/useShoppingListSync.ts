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
        
        // Initial sync with generated meal items to preserve all items
        if (generatedMealItems.length > 0) {
          const savedMealItems = stored.items.filter(item => !item.id.startsWith('manual-'));
          const mergedItems = mergeItemsPreservingAssignments(generatedMealItems, savedMealItems, savedManualItems);
          setAllItems(mergedItems);
          console.log("useShoppingListSync: Initial sync completed with", mergedItems.length, "total items");
        } else {
          // No meal items yet, just use saved manual items
          setAllItems(savedManualItems);
        }
      } else if (generatedMealItems.length > 0) {
        // No saved items, just use generated meal items
        setAllItems(generatedMealItems);
      }
      
      isInitializedRef.current = true;
    }
  }, [loadFromStorage, generatedMealItems]);

  // Smart merge function to preserve user assignments
  const mergeItemsPreservingAssignments = (newGeneratedItems: GroceryItem[], currentItems: GroceryItem[], manualItems: GroceryItem[]) => {
    console.log("useShoppingListSync: Merging items while preserving assignments");
    console.log("New generated items:", newGeneratedItems.length);
    console.log("Current items:", currentItems.length);
    console.log("Manual items:", manualItems.length);
    
    // Create a map of existing items for quick lookup
    const existingItemsMap = new Map<string, GroceryItem>();
    currentItems.forEach(item => {
      // Use normalized name as key to match items even if they come from different sources
      const key = item.name.toLowerCase().trim();
      existingItemsMap.set(key, item);
    });
    
    // Process generated items, preserving existing assignments
    const mergedGeneratedItems = newGeneratedItems.map(newItem => {
      const key = newItem.name.toLowerCase().trim();
      const existingItem = existingItemsMap.get(key);
      
      if (existingItem) {
        console.log(`useShoppingListSync: Preserving assignments for ${newItem.name}:`, {
          store: existingItem.store,
          category: existingItem.category,
          quantity: existingItem.quantity
        });
        
        // Preserve user assignments while keeping meal source info
        return {
          ...newItem, // Keep meal source and base properties
          store: existingItem.store || newItem.store, // Preserve store assignment
          category: existingItem.category || newItem.category, // Preserve category assignment
          quantity: existingItem.quantity || newItem.quantity, // Preserve quantity if user changed it
          __updateTimestamp: Date.now() // Force re-render
        };
      }
      
      return newItem;
    });
    
    // Combine with manual items (they always preserve their assignments)
    const finalItems = [...mergedGeneratedItems, ...manualItems];
    
    console.log("useShoppingListSync: Final merged items:", finalItems.length);
    return finalItems;
  };

  // Handle meal changes - intelligently merge while preserving assignments
  useEffect(() => {
    if (!isInitializedRef.current) {
      console.log("useShoppingListSync: Skipping meal update - not initialized");
      return;
    }

    console.log("useShoppingListSync: Checking meal changes");
    console.log("Previous meal key:", lastMealChangeRef.current);
    console.log("Current meal key:", mealChangeKey);
    
    if (mealChangeKey !== lastMealChangeRef.current) {
      console.log("useShoppingListSync: Meals changed, intelligently updating shopping list");
      console.log("Generated meal items:", generatedMealItems.length);
      console.log("Manual items to preserve:", manualItems.length);
      
      // Separate meal items from manual items in current allItems
      const currentMealItems = allItems.filter(item => !item.id.startsWith('manual-'));
      
      // Use smart merge to preserve user assignments - pass only meal items as current items
      const mergedItems = mergeItemsPreservingAssignments(generatedMealItems, currentMealItems, manualItems);
      
      setAllItems(mergedItems);
      lastMealChangeRef.current = mealChangeKey;
    }
  }, [mealChangeKey, generatedMealItems, manualItems, allItems]);

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
