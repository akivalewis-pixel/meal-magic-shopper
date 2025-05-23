
import { useState, useEffect, useRef } from "react";
import { GroceryItem, Meal } from "@/types";
import { generateShoppingList } from "@/utils/groceryUtils";
import { useToast } from "@/hooks/use-toast";

export function useSimpleShoppingList(meals: Meal[], pantryItems: string[] = []) {
  const [allItems, setAllItems] = useState<GroceryItem[]>([]);
  const [archivedItems, setArchivedItems] = useState<GroceryItem[]>([]);
  const [availableStores, setAvailableStores] = useState<string[]>([
    "Unassigned", "Supermarket", "Farmers Market", "Specialty Store"
  ]);
  
  // Use a ref to persistently track store assignments across renders
  const storeAssignments = useRef<Map<string, string>>(new Map());
  
  const { toast } = useToast();

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
      storeAssignments.current = new Map(JSON.parse(savedAssignments));
    }
  }, []);

  // Save to localStorage when state changes
  useEffect(() => {
    localStorage.setItem('shoppingList_stores', JSON.stringify(availableStores));
    localStorage.setItem('shoppingList_archived', JSON.stringify(archivedItems));
    localStorage.setItem('shoppingList_allItems', JSON.stringify(allItems));
    localStorage.setItem('shoppingList_storeAssignments', JSON.stringify(Array.from(storeAssignments.current.entries())));
  }, [availableStores, archivedItems, allItems]);

  // Generate shopping list from meals and merge with existing items
  useEffect(() => {
    console.log("useSimpleShoppingList: Regenerating list with", meals.length, "meals");
    
    let mealItems: GroceryItem[] = [];
    
    if (meals.length > 0) {
      const activeMeals = meals.filter(meal => meal.day && meal.day !== "");
      mealItems = generateShoppingList(activeMeals, pantryItems, []);
    }
    
    // Normalize meal items and apply stored assignments
    const normalizedMealItems = mealItems.map(item => {
      const storedStore = storeAssignments.current.get(item.name.toLowerCase());
      const assignedStore = storedStore || "Unassigned";
      
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
    
    console.log("useSimpleShoppingList: Combined items with preserved stores:", 
      combinedItems.map(i => ({ 
        name: i.name, 
        store: i.store, 
        source: i.id.startsWith('manual-') ? 'manual' : 'meal' 
      }))
    );
    
    setAllItems(combinedItems);
  }, [meals, pantryItems]);

  const updateItem = (updatedItem: GroceryItem) => {
    console.log("useSimpleShoppingList updateItem called:", updatedItem.name, "new store:", updatedItem.store);
    
    // Update store assignment in persistent storage
    if (updatedItem.store && updatedItem.store !== "Unassigned") {
      storeAssignments.current.set(updatedItem.name.toLowerCase(), updatedItem.store);
    } else {
      storeAssignments.current.delete(updatedItem.name.toLowerCase());
    }
    
    setAllItems(prevItems => {
      const updatedItems = prevItems.map(item => {
        if (item.id === updatedItem.id) {
          console.log("useSimpleShoppingList: Updating item:", item.name, "from store:", item.store, "to store:", updatedItem.store);
          const updated = {
            ...updatedItem,
            store: updatedItem.store || "Unassigned",
            __updateTimestamp: Date.now()
          };
          console.log("useSimpleShoppingList: Updated item result:", updated);
          return updated;
        }
        return item;
      });
      
      console.log("useSimpleShoppingList: All items after update:", updatedItems.map(i => ({ 
        id: i.id,
        name: i.name, 
        store: i.store,
        timestamp: i.__updateTimestamp 
      })));
      return updatedItems;
    });

    toast({
      title: "Item Updated", 
      description: `${updatedItem.name} ${updatedItem.store !== "Unassigned" ? `moved to ${updatedItem.store}` : 'updated'}`,
    });
  };

  const toggleItem = (id: string) => {
    setAllItems(prev => 
      prev.map(item => 
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    );
  };

  const archiveItem = (id: string) => {
    const item = allItems.find(i => i.id === id);
    if (!item) return;

    setArchivedItems(prev => [...prev, { ...item, checked: true }]);
    setAllItems(prev => prev.filter(i => i.id !== id));
    
    toast({
      title: "Item Archived",
      description: `${item.name} moved to archive`,
    });
  };

  const addItem = (newItem: GroceryItem) => {
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
  };

  const updateStores = (newStores: string[]) => {
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
  };

  const resetList = () => {
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
  };

  return {
    groceryItems: allItems,
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
