
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

  // Simplified combined items calculation
  const combinedItems = useMemo(() => {
    const manualItemNames = new Set(manualItems.map(item => item.name.toLowerCase()));
    
    // Process meal items with overrides
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
    
    // Add active manual items
    const activeManualItems = manualItems.filter(item => !removedItemIds.has(item.id));
    
    return [...enhancedMealItems, ...activeManualItems];
  }, [mealItems, manualItems, itemOverrides, storeAssignments, removedItemIds]);

  // Simplified update function
  const updateItem = useCallback((updatedItem: GroceryItem) => {
    console.log("useSimpleShoppingList: Updating item", updatedItem.name);
    
    // Update store assignment
    if (updatedItem.store && updatedItem.store !== "Unassigned") {
      storeAssignments.current.set(updatedItem.name.toLowerCase(), updatedItem.store);
    } else if (updatedItem.store === "Unassigned") {
      storeAssignments.current.delete(updatedItem.name.toLowerCase());
    }

    const isMealItem = updatedItem.id.includes('-') && !updatedItem.id.startsWith('manual-');
    
    if (isMealItem) {
      // Store as override for meal items
      setItemOverrides(prev => {
        const newOverrides = new Map(prev);
        newOverrides.set(updatedItem.id, {
          name: updatedItem.name,
          quantity: updatedItem.quantity,
          category: updatedItem.category,
          store: updatedItem.store,
          __updateTimestamp: Date.now()
        });
        return newOverrides;
      });
    } else {
      // Update manual item directly
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
  }, [storeAssignments, saveToLocalStorage]);

  // Simplified archive function with immediate UI update
  const archiveItem = useCallback((id: string) => {
    console.log("useSimpleShoppingList: Archiving item with id:", id);
    const item = combinedItems.find(i => i.id === id);
    if (!item) return;

    // Immediately remove from UI
    setRemovedItemIds(prev => new Set(prev).add(id));

    // Add to archived items
    setArchivedItems(prev => [...prev, { ...item, checked: true }]);
    
    // Remove from manual items if applicable
    if (id.startsWith('manual-')) {
      setManualItems(prev => prev.filter(i => i.id !== id));
    }
    
    setTimeout(saveToLocalStorage, 100);
  }, [combinedItems, setArchivedItems, saveToLocalStorage]);

  const actions = useShoppingListActions({
    allItems: combinedItems,
    setAllItems: (items) => {
      // Handle both function and direct updates
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
    },
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

  // Sync with global state only when needed
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
    archiveItem,
    ...actions
  };
}
