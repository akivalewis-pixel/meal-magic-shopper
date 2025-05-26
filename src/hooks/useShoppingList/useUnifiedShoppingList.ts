import { useState, useEffect, useRef, useCallback } from "react";
import { Meal, GroceryItem } from "@/types";
import { generateShoppingList } from "@/utils/groceryUtils";

export type ItemStatus = 'active' | 'checked' | 'archived';

export interface UnifiedGroceryItem extends Omit<GroceryItem, 'checked'> {
  status: ItemStatus;
  source: 'meal' | 'manual';
  mealId?: string;
  originalMealData?: Partial<GroceryItem>;
}

export function useUnifiedShoppingList(meals: Meal[], pantryItems: string[] = []) {
  const [items, setItems] = useState<UnifiedGroceryItem[]>([]);
  const [availableStores, setAvailableStores] = useState<string[]>([
    "Unassigned", "Supermarket", "Farmers Market", "Specialty Store"
  ]);
  const storeAssignments = useRef<Map<string, string>>(new Map());
  const isInitializedRef = useRef(false);
  const isProcessingRef = useRef(false);

  // Load from localStorage on mount
  useEffect(() => {
    if (!isInitializedRef.current) {
      try {
        const savedItems = localStorage.getItem('shoppingList_unified_items');
        const savedStores = localStorage.getItem('shoppingList_stores');
        const savedAssignments = localStorage.getItem('shoppingList_storeAssignments');

        if (savedStores) {
          setAvailableStores(JSON.parse(savedStores));
        }

        if (savedItems) {
          const loadedItems = JSON.parse(savedItems);
          setItems(loadedItems);
        }

        if (savedAssignments) {
          storeAssignments.current = new Map(JSON.parse(savedAssignments));
        }

        isInitializedRef.current = true;
      } catch (error) {
        console.warn('Failed to load from localStorage:', error);
        isInitializedRef.current = true;
      }
    }
  }, []);

  // Save to localStorage immediately when state changes
  const saveToStorage = useCallback(() => {
    if (!isInitializedRef.current || isProcessingRef.current) return;

    try {
      localStorage.setItem('shoppingList_unified_items', JSON.stringify(items));
      localStorage.setItem('shoppingList_stores', JSON.stringify(availableStores));
      localStorage.setItem('shoppingList_storeAssignments', 
        JSON.stringify(Array.from(storeAssignments.current.entries())));
    } catch (error) {
      console.warn('Failed to save to localStorage:', error);
    }
  }, [items, availableStores]);

  // Save whenever items or stores change
  useEffect(() => {
    saveToStorage();
  }, [saveToStorage]);

  // Generate meal items and sync with existing items
  useEffect(() => {
    if (!isInitializedRef.current) return;

    const mealGroceryItems = generateShoppingList(meals, pantryItems);
    
    setItems(currentItems => {
      // Keep existing manual items and checked/archived items
      const manualItems = currentItems.filter(item => item.source === 'manual');
      const existingMealItems = currentItems.filter(item => item.source === 'meal');
      
      // Convert new meal items to unified format
      const newMealItems: UnifiedGroceryItem[] = mealGroceryItems.map(mealItem => {
        // Check if this item already exists
        const existingItem = existingMealItems.find(item => item.id === mealItem.id);
        
        if (existingItem) {
          // Keep existing item but update with fresh meal data if not modified
          return {
            ...existingItem,
            // Only update if item is still active (not checked/archived)
            ...(existingItem.status === 'active' ? {
              name: existingItem.originalMealData?.name || mealItem.name,
              quantity: existingItem.originalMealData?.quantity || mealItem.quantity,
              category: existingItem.originalMealData?.category || mealItem.category,
            } : {}),
            originalMealData: {
              name: mealItem.name,
              quantity: mealItem.quantity,
              category: mealItem.category,
              store: mealItem.store
            }
          };
        }

        // Create new meal item
        const savedStore = storeAssignments.current.get(mealItem.name.toLowerCase());
        return {
          ...mealItem,
          status: 'active' as ItemStatus,
          source: 'meal' as const,
          store: savedStore || mealItem.store || "Unassigned",
          originalMealData: {
            name: mealItem.name,
            quantity: mealItem.quantity,
            category: mealItem.category,
            store: mealItem.store
          }
        };
      });

      return [...newMealItems, ...manualItems];
    });
  }, [meals, pantryItems]);

  // Toggle item status (active -> checked -> archived)
  const toggleItem = useCallback((id: string) => {
    isProcessingRef.current = true;
    
    setItems(currentItems => {
      return currentItems.map(item => {
        if (item.id === id && item.status === 'active') {
          console.log("Unified: Checking item", item.name);
          return {
            ...item,
            status: 'checked' as ItemStatus,
            __updateTimestamp: Date.now()
          };
        }
        return item;
      });
    });

    // Clear processing flag after a brief moment to allow state to settle
    setTimeout(() => {
      isProcessingRef.current = false;
    }, 100);
  }, []);

  // Archive item (move from checked to archived)
  const archiveItem = useCallback((id: string) => {
    setItems(currentItems => {
      return currentItems.map(item => {
        if (item.id === id && item.status === 'checked') {
          console.log("Unified: Archiving item", item.name);
          return {
            ...item,
            status: 'archived' as ItemStatus,
            __updateTimestamp: Date.now()
          };
        }
        return item;
      });
    });
  }, []);

  // Update item
  const updateItem = useCallback((updatedItem: UnifiedGroceryItem) => {
    // Update store assignment
    if (updatedItem.store && updatedItem.store !== "Unassigned") {
      storeAssignments.current.set(updatedItem.name.toLowerCase(), updatedItem.store);
    }

    setItems(currentItems => {
      return currentItems.map(item => {
        if (item.id === updatedItem.id) {
          return {
            ...updatedItem,
            __updateTimestamp: Date.now()
          };
        }
        return item;
      });
    });
  }, []);

  // Add manual item
  const addItem = useCallback((newItem: Omit<GroceryItem, 'id' | 'checked'>) => {
    const unifiedItem: UnifiedGroceryItem = {
      ...newItem,
      id: `manual-${newItem.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
      status: 'active',
      source: 'manual',
      store: newItem.store || "Unassigned"
    };

    setItems(currentItems => [...currentItems, unifiedItem]);
  }, []);

  // Get items by status
  const activeItems = items.filter(item => item.status === 'active');
  const checkedItems = items.filter(item => item.status === 'checked');
  const archivedItems = items.filter(item => item.status === 'archived');

  // Convert to legacy format for compatibility
  const groceryItems: GroceryItem[] = activeItems.map(item => ({
    id: item.id,
    name: item.name,
    category: item.category,
    quantity: item.quantity,
    checked: false,
    meal: item.mealId,
    store: item.store,
    department: item.department,
    __updateTimestamp: item.__updateTimestamp
  }));

  const archivedGroceryItems: GroceryItem[] = [...checkedItems, ...archivedItems].map(item => ({
    id: item.id,
    name: item.name,
    category: item.category,
    quantity: item.quantity,
    checked: true,
    meal: item.mealId,
    store: item.store,
    department: item.department,
    __updateTimestamp: item.__updateTimestamp
  }));

  return {
    groceryItems,
    archivedItems: archivedGroceryItems,
    availableStores,
    updateItem: (item: GroceryItem) => {
      const unifiedItem: UnifiedGroceryItem = {
        ...item,
        status: item.checked ? 'checked' : 'active',
        source: item.id.startsWith('manual-') ? 'manual' : 'meal'
      };
      updateItem(unifiedItem);
    },
    toggleItem,
    archiveItem,
    addItem,
    updateStores: setAvailableStores,
    resetList: () => {
      setItems(currentItems => 
        currentItems.map(item => ({ ...item, status: 'archived' as ItemStatus }))
      );
    }
  };
}
