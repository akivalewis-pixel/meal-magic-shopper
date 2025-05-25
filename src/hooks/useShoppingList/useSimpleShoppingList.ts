import { useEffect, useState, useRef } from "react";
import { Meal, GroceryItem } from "@/types";
import { useShoppingListState } from "./useShoppingListState";
import { useShoppingListPersistence } from "./useShoppingListPersistence";
import { useShoppingListGeneration } from "./useShoppingListGeneration";
import { useShoppingListActions } from "./useShoppingListActions";
import { useShoppingListItems } from "./useShoppingListItems";
import { useShoppingListOverrides } from "./useShoppingListOverrides";
import { useShoppingListArchive } from "./useShoppingListArchive";

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
    itemOverrides,
    updateOverride,
    loadOverrides,
    setItemOverrides
  } = useShoppingListOverrides();

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

  const { combinedItems } = useShoppingListItems({
    mealItems,
    manualItems,
    itemOverrides,
    storeAssignments
  });

  const { archiveItem } = useShoppingListArchive({
    combinedItems,
    setArchivedItems,
    updateOverride,
    setManualItems,
    saveToLocalStorage
  });

  // Enhanced toggle function to properly mark items as checked before archiving
  const toggleItem = (id: string) => {
    console.log("useSimpleShoppingList: toggleItem called for id:", id);
    
    // Find the item first
    const item = combinedItems.find(item => item.id === id);
    if (!item) {
      console.log("useSimpleShoppingList: Item not found for id:", id);
      return;
    }
    
    console.log("useSimpleShoppingList: Found item to toggle:", item.name, "current checked status:", item.checked);
    
    // Mark the item as checked FIRST
    const isMealItem = id.includes('-') && !id.startsWith('manual-');
    
    if (isMealItem) {
      console.log("useSimpleShoppingList: Setting meal item as checked via override");
      updateOverride(id, { checked: true });
    } else {
      console.log("useSimpleShoppingList: Setting manual item as checked");
      setManualItems(prev => 
        prev.map(manualItem => 
          manualItem.id === id 
            ? { ...manualItem, checked: true, __updateTimestamp: Date.now() }
            : manualItem
        )
      );
    }
    
    // Then archive the item
    setTimeout(() => {
      console.log("useSimpleShoppingList: Archiving item after marking as checked");
      archiveItem(id);
    }, 100);
  };

  // Simplified update function
  const updateItem = (updatedItem: GroceryItem) => {
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
      updateOverride(updatedItem.id, {
        name: updatedItem.name,
        quantity: updatedItem.quantity,
        category: updatedItem.category,
        store: updatedItem.store,
        checked: updatedItem.checked
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
  };

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
        loadOverrides(savedData.items);
      }
      
      console.log("useSimpleShoppingList: Loaded from storage");
      isInitializedRef.current = true;
    }
  }, [loadFromStorage, setAvailableStores, setArchivedItems, loadOverrides]);

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
    toggleItem,
    archiveItem,
    ...actions
  };
}
