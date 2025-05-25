
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

  // Simplified combined items calculation - filter out checked items immediately
  const combinedItems = useMemo(() => {
    const manualItemNames = new Set(manualItems.map(item => item.name.toLowerCase()));
    
    // Process meal items with overrides, filter out checked items
    const enhancedMealItems = mealItems
      .filter(item => !manualItemNames.has(item.name.toLowerCase()))
      .map(item => {
        const savedStore = storeAssignments.current.get(item.name.toLowerCase());
        const overrides = itemOverrides.get(item.id) || {};
        
        return {
          ...item,
          ...overrides,
          store: overrides.store || savedStore || item.store || "Unassigned",
          checked: overrides.checked || false
        };
      })
      .filter(item => !item.checked); // Remove checked items from active list
    
    // Add active manual items (not checked)
    const activeManualItems = manualItems.filter(item => !item.checked);
    
    return [...enhancedMealItems, ...activeManualItems];
  }, [mealItems, manualItems, itemOverrides, storeAssignments]);

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
          checked: updatedItem.checked,
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

  // Archive function that immediately moves items to archive
  const archiveItem = useCallback((id: string) => {
    console.log("useSimpleShoppingList: Archiving item with id:", id);
    const item = combinedItems.find(i => i.id === id);
    if (!item) {
      console.log("useSimpleShoppingList: Item not found for archiving:", id);
      return;
    }

    console.log("useSimpleShoppingList: Found item to archive:", item.name);

    // Create archived item
    const archivedItem = { ...item, checked: true, __updateTimestamp: Date.now() };
    
    // Add to archived items immediately
    setArchivedItems(prev => [...prev, archivedItem]);
    
    // Update the item to mark it as checked
    const isMealItem = id.includes('-') && !id.startsWith('manual-');
    
    if (isMealItem) {
      // Mark meal item as checked in overrides
      setItemOverrides(prev => {
        const newOverrides = new Map(prev);
        const existingOverride = newOverrides.get(id) || {};
        newOverrides.set(id, {
          ...existingOverride,
          checked: true,
          __updateTimestamp: Date.now()
        });
        return newOverrides;
      });
    } else {
      // Mark manual item as checked
      setManualItems(prev => 
        prev.map(item => 
          item.id === id 
            ? { ...item, checked: true, __updateTimestamp: Date.now() }
            : item
        )
      );
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
            if (item.checked !== (originalMealItem.checked || false)) overrideData.checked = item.checked;
            
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
              checked: item.checked,
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
