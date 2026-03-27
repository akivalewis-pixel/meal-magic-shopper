import { useState, useEffect, useRef } from "react";
import { logger } from "@/utils/logger";
import { GroceryItem, Meal } from "@/types";
import { useShoppingListPersistence } from "./useShoppingListPersistence";
import { useShoppingListGeneration } from "./useShoppingListGeneration";
import { useShoppingListRealtime } from "./useShoppingListRealtime";

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
  const loadingRef = useRef(false);
  const lastMealChangeRef = useRef<string>('');
  const allItemsRef = useRef<GroceryItem[]>([]);
  const archivedItemsRef = useRef<GroceryItem[]>([]);

  // Persistence with store assignments
  const { storeAssignments, loadFromStorage, saveToLocalStorage, saveToDatabase } = useShoppingListPersistence(
    availableStores,
    archivedItems,
    allItems,
    setAllItems,
    setArchivedItems
  );

  // Real-time sync for cross-device updates
  useShoppingListRealtime({ setAllItems, isInitializedRef });

  // Generate items from meals using the existing hook
  const generatedMealItems = useShoppingListGeneration(meals, pantryItems, storeAssignments);

  // Create meal change detection key
  const mealChangeKey = meals
    .filter(meal => meal.day && meal.day !== "")
    .map(meal => `${meal.id}-${meal.title}-${meal.day}-${meal.ingredients.join(',')}`)
    .sort()
    .join('|');

  // Keep allItemsRef in sync
  useEffect(() => {
    allItemsRef.current = allItems;
  }, [allItems]);

  // Load from storage on mount
  useEffect(() => {
    if (isInitializedRef.current || loadingRef.current) return;
    loadingRef.current = true;
    
    console.log("useShoppingListSync: Loading from storage on mount");
    
    const loadData = async () => {
      try {
        const stored = await loadFromStorage();
        
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
          
          const savedManualItems = stored.items.filter(item => item.id.startsWith('manual-'));
          setManualItems(savedManualItems);
          console.log("useShoppingListSync: Found manual items:", savedManualItems.length);
          
          if (generatedMealItems.length > 0) {
            const savedMealItems = stored.items.filter(item => !item.id.startsWith('manual-'));
            const mergedItems = mergeItemsPreservingAssignments(generatedMealItems, savedMealItems, savedManualItems);
            setAllItems(mergedItems);
          } else {
            setAllItems(savedManualItems);
          }
        } else if (generatedMealItems.length > 0) {
          setAllItems(generatedMealItems);
        }
        
        // Set the meal change key so the meal effect doesn't re-run immediately
        lastMealChangeRef.current = mealChangeKey;
        isInitializedRef.current = true;
        loadingRef.current = false;
      } catch (error) {
        console.error("useShoppingListSync: Error loading from storage:", error);
        isInitializedRef.current = true;
        loadingRef.current = false;
      }
    };
    
    loadData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    
    // Find orphaned non-manual items (exist in current but not in generated set)
    const generatedNames = new Set(newGeneratedItems.map(i => i.name.toLowerCase().trim()));
    const orphanedItems = currentItems.filter(item => {
      const key = item.name.toLowerCase().trim();
      return !generatedNames.has(key);
    });
    
    if (orphanedItems.length > 0) {
      logger.log("useShoppingListSync: Preserving", orphanedItems.length, "orphaned items:", orphanedItems.map(i => i.name));
    }

    // Combine: generated (with preserved assignments) + orphaned non-manual items + manual items
    const finalItems = [...mergedGeneratedItems, ...orphanedItems, ...manualItems];
    
    console.log("useShoppingListSync: Final merged items:", finalItems.length);
    return finalItems;
  };

  // Handle meal changes - use ref to avoid re-running when manual items change
  useEffect(() => {
    if (!isInitializedRef.current) return;

    if (mealChangeKey !== lastMealChangeRef.current) {
      console.log("useShoppingListSync: Meals changed, updating shopping list");
      
      const currentItems = allItemsRef.current;
      const currentManualItems = currentItems.filter(item => item.id.startsWith('manual-'));
      const currentMealItems = currentItems.filter(item => !item.id.startsWith('manual-'));
      
      const mergedItems = mergeItemsPreservingAssignments(generatedMealItems, currentMealItems, currentManualItems);
      
      setAllItems(mergedItems);
      setManualItems(currentManualItems);
      lastMealChangeRef.current = mealChangeKey;
    }
  }, [mealChangeKey, generatedMealItems]);

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
    saveToLocalStorage,
    saveToDatabase
  };
}
