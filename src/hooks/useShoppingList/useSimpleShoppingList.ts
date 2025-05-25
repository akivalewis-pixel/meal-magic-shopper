
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
  const [itemOverrides, setItemOverrides] = useState<Map<string, Partial<GroceryItem>>>(new Map());
  const [removedItemIds, setRemovedItemIds] = useState<Set<string>>(new Set());
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

  // Apply overrides and store assignments to meal items and combine with manual items
  const combinedItems = useMemo(() => {
    const manualItemNames = new Set(manualItems.map(item => item.name.toLowerCase()));
    
    // Apply overrides to meal items and filter out conflicts with manual items and removed items
    const enhancedMealItems = mealItems
      .filter(item => !manualItemNames.has(item.name.toLowerCase()) && !removedItemIds.has(item.id))
      .map(item => {
        const savedStore = storeAssignments.current.get(item.name.toLowerCase());
        const overrides = itemOverrides.get(item.id) || {};
        
        return {
          ...item,
          ...overrides,
          store: overrides.store || savedStore || item.store || "Unassigned"
        };
      });
    
    // Filter out removed manual items
    const activeManualItems = manualItems.filter(item => !removedItemIds.has(item.id));
    
    return [...enhancedMealItems, ...activeManualItems];
  }, [mealItems, manualItems, itemOverrides, storeAssignments, removedItemIds]);

  // Simplified update function with immediate UI feedback
  const updateItem = useCallback((updatedItem: GroceryItem) => {
    console.log("useSimpleShoppingList: RECEIVED UPDATE for item", updatedItem.name, {
      id: updatedItem.id,
      changes: {
        store: updatedItem.store,
        category: updatedItem.category,
        quantity: updatedItem.quantity,
        name: updatedItem.name
      }
    });
    
    // Update store assignment immediately if store changed
    if (updatedItem.store && updatedItem.store !== "Unassigned") {
      storeAssignments.current.set(updatedItem.name.toLowerCase(), updatedItem.store);
    } else if (updatedItem.store === "Unassigned") {
      storeAssignments.current.delete(updatedItem.name.toLowerCase());
    }

    const isMealItem = updatedItem.id.includes('-') && !updatedItem.id.startsWith('manual-');
    
    if (isMealItem) {
      console.log("useSimpleShoppingList: Applying override to meal item:", updatedItem.name);
      
      // For meal items, store as override
      setItemOverrides(prev => {
        const newOverrides = new Map(prev);
        newOverrides.set(updatedItem.id, {
          name: updatedItem.name,
          quantity: updatedItem.quantity,
          category: updatedItem.category,
          store: updatedItem.store,
          __updateTimestamp: Date.now()
        });
        console.log("useSimpleShoppingList: Updated overrides for", updatedItem.name);
        return newOverrides;
      });
    } else {
      // Update existing manual item
      console.log("useSimpleShoppingList: Updating manual item:", updatedItem.name);
      setManualItems(prev => {
        const newItems = prev.map(item => 
          item.id === updatedItem.id 
            ? { ...updatedItem, __updateTimestamp: Date.now() }
            : item
        );
        console.log("useSimpleShoppingList: Manual items updated");
        return newItems;
      });
    }

    // Trigger save
    console.log("useSimpleShoppingList: TRIGGERING SAVE");
    setTimeout(saveToLocalStorage, 100);
  }, [storeAssignments, setItemOverrides, setManualItems, saveToLocalStorage]);

  // Enhanced setAllItems callback that handles the combined approach
  const handleSetAllItems = useCallback((items: GroceryItem[] | ((prev: GroceryItem[]) => GroceryItem[])) => {
    let updatedItems: GroceryItem[];
    
    if (typeof items === 'function') {
      updatedItems = items(combinedItems);
    } else {
      updatedItems = items;
    }
    
    // Separate manual items and overrides
    const newManualItems = updatedItems.filter(item => item.id.startsWith('manual-'));
    setManualItems(newManualItems);
    
    // Save overrides for meal items
    const newOverrides = new Map<string, Partial<GroceryItem>>();
    updatedItems.forEach(item => {
      if (item.id.includes('-') && !item.id.startsWith('manual-')) {
        const originalMealItem = mealItems.find(mi => mi.id === item.id);
        if (originalMealItem) {
          const overrideData: Partial<GroceryItem> = {};
          if (item.name !== originalMealItem.name) overrideData.name = item.name;
          if (item.quantity !== originalMealItem.quantity) overrideData.quantity = item.quantity;
          if (item.category !== originalMealItem.category) overrideData.category = item.category;
          if (item.store !== originalMealItem.store) overrideData.store = item.store;
          
          if (Object.keys(overrideData).length > 0) {
            newOverrides.set(item.id, { ...overrideData, __updateTimestamp: Date.now() });
          }
        }
      }
    });
    
    setItemOverrides(newOverrides);
    setTimeout(saveToLocalStorage, 100);
  }, [combinedItems, mealItems, saveToLocalStorage]);

  // Custom archive function that immediately removes from UI
  const archiveItem = useCallback((id: string) => {
    console.log("useSimpleShoppingList: Archiving item with id:", id);
    const item = combinedItems.find(i => i.id === id);
    if (!item) {
      console.log("useSimpleShoppingList: Item not found for archiving:", id);
      return;
    }

    // Add to removed items set for immediate UI update
    setRemovedItemIds(prev => {
      const newSet = new Set(prev);
      newSet.add(id);
      console.log("useSimpleShoppingList: Added to removed items:", id);
      return newSet;
    });

    // Add to archived items
    setArchivedItems(prev => [...prev, { ...item, checked: true }]);
    
    // Remove from manual items if it's a manual item
    if (id.startsWith('manual-')) {
      setManualItems(prev => prev.filter(i => i.id !== id));
    }
    
    console.log("useSimpleShoppingList: Item archived:", item.name);
    setTimeout(saveToLocalStorage, 100);
  }, [combinedItems, setArchivedItems, setManualItems, saveToLocalStorage]);

  const actions = useShoppingListActions({
    allItems: combinedItems,
    setAllItems: handleSetAllItems,
    archivedItems,
    setArchivedItems,
    storeAssignments,
    saveToLocalStorage: () => setTimeout(saveToLocalStorage, 100),
    setAvailableStores
  });

  // Load from localStorage on mount
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
        
        // Load overrides from saved items
        const savedOverrides = new Map<string, Partial<GroceryItem>>();
        savedData.items.forEach((item: GroceryItem) => {
          if (item.id.includes('-') && !item.id.startsWith('manual-')) {
            // This is a meal item with overrides
            savedOverrides.set(item.id, {
              name: item.name,
              quantity: item.quantity,
              category: item.category,
              store: item.store,
              __updateTimestamp: item.__updateTimestamp
            });
          }
        });
        setItemOverrides(savedOverrides);
      }
      
      console.log("useSimpleShoppingList: Loaded from storage");
      isInitializedRef.current = true;
    }
  }, [loadFromStorage, setAvailableStores, setArchivedItems]);

  // Update allItems only when initialized to avoid circular dependencies
  useEffect(() => {
    if (isInitializedRef.current) {
      // Only update if items have actually changed to prevent loops
      const currentItemIds = new Set(allItems.map(item => item.id));
      const newItemIds = new Set(combinedItems.map(item => item.id));
      
      const hasChanged = currentItemIds.size !== newItemIds.size || 
        !Array.from(currentItemIds).every(id => newItemIds.has(id));
      
      if (hasChanged) {
        console.log("useSimpleShoppingList: Updating allItems due to changes");
        setAllItems(combinedItems);
      }
    }
  }, [combinedItems, setAllItems, allItems]);

  // Return combinedItems directly as groceryItems for immediate UI updates
  return {
    groceryItems: combinedItems, // Return combinedItems directly for immediate updates
    archivedItems,
    availableStores,
    updateItem,
    archiveItem, // Override the archiveItem from actions
    ...actions
  };
}
