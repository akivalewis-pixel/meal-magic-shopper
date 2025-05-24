
import { useState, useEffect, useRef, useCallback } from "react";
import { GroceryItem, Meal } from "@/types";
import { generateShoppingList } from "@/utils/groceryUtils";
import { useToast } from "@/hooks/use-toast";
import { useOptimisticUpdates } from "./useOptimisticUpdates";

export function useSimpleShoppingList(meals: Meal[], pantryItems: string[] = []) {
  const [allItems, setAllItems] = useState<GroceryItem[]>([]);
  const [archivedItems, setArchivedItems] = useState<GroceryItem[]>([]);
  const [availableStores, setAvailableStores] = useState<string[]>([
    "Unassigned", "Supermarket", "Farmers Market", "Specialty Store"
  ]);
  
  // Enhanced persistent store assignments
  const storeAssignments = useRef<Map<string, string>>(new Map());
  const lastSavedAssignments = useRef<string>('');
  
  const { toast } = useToast();
  const { applyOptimisticUpdate, confirmUpdate, applyOptimisticUpdatesToItems } = useOptimisticUpdates();

  // Load from localStorage on mount
  useEffect(() => {
    const savedStores = localStorage.getItem('shoppingList_stores');
    const savedArchived = localStorage.getItem('shoppingList_archived');
    const savedItems = localStorage.getItem('shoppingList_allItems');
    const savedAssignments = localStorage.getItem('shoppingList_storeAssignments');
    
    if (savedStores) {
      setAvailableStores(JSON.parse(savedStores));
    }
    if (savedArchived) {
      setArchivedItems(JSON.parse(savedArchived));
    }
    if (savedItems) {
      const items = JSON.parse(savedItems);
      setAllItems(items);
      // Initialize store assignments from loaded items
      items.forEach((item: GroceryItem) => {
        if (item.store && item.store !== "Unassigned") {
          storeAssignments.current.set(item.name.toLowerCase(), item.store);
        }
      });
    }
    if (savedAssignments) {
      const assignments = JSON.parse(savedAssignments);
      storeAssignments.current = new Map(assignments);
      lastSavedAssignments.current = savedAssignments;
      console.log("useSimpleShoppingList: Loaded store assignments:", assignments);
    }
  }, []);

  // Enhanced save to localStorage with assignment persistence
  const saveToLocalStorage = useCallback(() => {
    localStorage.setItem('shoppingList_stores', JSON.stringify(availableStores));
    localStorage.setItem('shoppingList_archived', JSON.stringify(archivedItems));
    localStorage.setItem('shoppingList_allItems', JSON.stringify(allItems));
    
    const currentAssignments = JSON.stringify(Array.from(storeAssignments.current.entries()));
    if (currentAssignments !== lastSavedAssignments.current) {
      localStorage.setItem('shoppingList_storeAssignments', currentAssignments);
      lastSavedAssignments.current = currentAssignments;
      console.log("useSimpleShoppingList: Saved store assignments:", currentAssignments);
    }
  }, [availableStores, archivedItems, allItems]);

  useEffect(() => {
    saveToLocalStorage();
  }, [saveToLocalStorage]);

  // Generate shopping list from meals with enhanced store assignment
  useEffect(() => {
    console.log("useSimpleShoppingList: Regenerating list with", meals.length, "meals");
    
    let mealItems: GroceryItem[] = [];
    
    if (meals.length > 0) {
      const activeMeals = meals.filter(meal => meal.day && meal.day !== "");
      mealItems = generateShoppingList(activeMeals, pantryItems, []);
    }
    
    // Apply stored assignments with enhanced persistence
    const normalizedMealItems = mealItems.map(item => {
      const storedStore = storeAssignments.current.get(item.name.toLowerCase());
      const assignedStore = storedStore || "Unassigned";
      
      console.log("useSimpleShoppingList: Assigning store for", item.name, "stored:", storedStore, "final:", assignedStore);
      
      return {
        ...item,
        store: assignedStore,
        id: `meal-${item.name}-${item.meal || 'default'}-${Date.now()}-${Math.random()}`,
        source: 'meal' as const,
        __updateTimestamp: Date.now()
      };
    });

    // Keep manual items that don't conflict with meal items
    const manualItems = allItems.filter(item => 
      item.id.startsWith('manual-') && 
      !normalizedMealItems.some(mealItem => 
        mealItem.name.toLowerCase() === item.name.toLowerCase()
      )
    );
    
    const combinedItems = [...normalizedMealItems, ...manualItems];
    
    console.log("useSimpleShoppingList: Final combined items:", 
      combinedItems.map(i => ({ 
        name: i.name, 
        store: i.store, 
        source: i.id.startsWith('manual-') ? 'manual' : 'meal' 
      }))
    );
    
    setAllItems(combinedItems);
  }, [meals, pantryItems]);

  // Enhanced updateItem with optimistic updates and better persistence
  const updateItem = useCallback((updatedItem: GroceryItem) => {
    console.log("useSimpleShoppingList: updateItem called with:", {
      name: updatedItem.name,
      store: updatedItem.store,
      quantity: updatedItem.quantity,
      id: updatedItem.id
    });
    
    // Apply optimistic update immediately for UI responsiveness
    if (updatedItem.store !== undefined) {
      applyOptimisticUpdate(updatedItem.id, { store: updatedItem.store });
    }
    if (updatedItem.quantity !== undefined) {
      applyOptimisticUpdate(updatedItem.id, { quantity: updatedItem.quantity });
    }
    if (updatedItem.name !== undefined) {
      applyOptimisticUpdate(updatedItem.id, { name: updatedItem.name });
    }
    
    // Update store assignment persistence immediately
    if (updatedItem.store && updatedItem.store !== "Unassigned") {
      storeAssignments.current.set(updatedItem.name.toLowerCase(), updatedItem.store);
      console.log("useSimpleShoppingList: Stored assignment:", updatedItem.name, "->", updatedItem.store);
    } else if (updatedItem.store === "Unassigned") {
      storeAssignments.current.delete(updatedItem.name.toLowerCase());
    }
    
    // Update the actual state
    setAllItems(prevItems => {
      const updatedItems = prevItems.map(item => {
        if (item.id === updatedItem.id) {
          const updated = {
            ...updatedItem,
            __updateTimestamp: Date.now()
          };
          console.log("useSimpleShoppingList: State updated for:", updated.name, "store:", updated.store);
          
          // Confirm the optimistic update
          setTimeout(() => confirmUpdate(updatedItem.id), 100);
          
          return updated;
        }
        return item;
      });
      
      return updatedItems;
    });

    // Save assignments immediately
    setTimeout(saveToLocalStorage, 100);

    // Show toast feedback
    const changes = [];
    if (updatedItem.store && updatedItem.store !== "Unassigned") {
      changes.push(`moved to ${updatedItem.store}`);
    }
    if (updatedItem.quantity) {
      changes.push(`quantity set to ${updatedItem.quantity}`);
    }
    
    const description = changes.length > 0 ? changes.join(', ') : 'updated';

    toast({
      title: "Item Updated", 
      description: `${updatedItem.name} ${description}`,
    });
  }, [applyOptimisticUpdate, confirmUpdate, saveToLocalStorage, toast]);

  const toggleItem = useCallback((id: string) => {
    setAllItems(prev => 
      prev.map(item => 
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    );
  }, []);

  const archiveItem = useCallback((id: string) => {
    const item = allItems.find(i => i.id === id);
    if (!item) return;

    setArchivedItems(prev => [...prev, { ...item, checked: true }]);
    setAllItems(prev => prev.filter(i => i.id !== id));
    
    toast({
      title: "Item Archived",
      description: `${item.name} moved to archive`,
    });
  }, [allItems, toast]);

  const addItem = useCallback((newItem: GroceryItem) => {
    const itemWithId = {
      ...newItem,
      id: `manual-${Date.now()}-${Math.random()}`,
      store: newItem.store || "Unassigned",
      source: 'manual' as const
    };
    
    console.log("useSimpleShoppingList: Adding manual item:", itemWithId);
    
    setAllItems(prev => [...prev, itemWithId]);
    
    toast({
      title: "Item Added",
      description: `${newItem.name} added to shopping list`,
    });
  }, [toast]);

  const updateStores = useCallback((newStores: string[]) => {
    setAvailableStores(newStores);
    
    // Update items that have invalid stores
    setAllItems(prev => 
      prev.map(item => {
        if (item.store && !newStores.includes(item.store)) {
          return { ...item, store: "Unassigned" };
        }
        return item;
      })
    );
    
    toast({
      title: "Stores Updated",
      description: "Store list has been updated",
    });
  }, [toast]);

  const resetList = useCallback(() => {
    const itemsToArchive = allItems.map(item => ({
      ...item,
      checked: true,
      id: `archived-${Date.now()}-${item.id}`
    }));
    
    setArchivedItems(prev => [...prev, ...itemsToArchive]);
    setAllItems([]);
    
    toast({
      title: "List Reset",
      description: `${itemsToArchive.length} items archived`,
    });
  }, [allItems, toast]);

  // Apply optimistic updates to the grocery items before returning
  const groceryItemsWithOptimisticUpdates = applyOptimisticUpdatesToItems(allItems);

  return {
    groceryItems: groceryItemsWithOptimisticUpdates,
    archivedItems,
    availableStores,
    updateItem,
    toggleItem,
    archiveItem,
    addItem,
    updateStores,
    resetList
  };
}
