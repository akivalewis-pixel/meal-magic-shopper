
import { useState, useEffect } from "react";
import { GroceryItem, Meal } from "@/types";
import { generateShoppingList } from "@/utils/groceryUtils";
import { useToast } from "@/hooks/use-toast";

export function useSimpleShoppingList(meals: Meal[], pantryItems: string[] = []) {
  const [allItems, setAllItems] = useState<GroceryItem[]>([]);
  const [archivedItems, setArchivedItems] = useState<GroceryItem[]>([]);
  const [availableStores, setAvailableStores] = useState<string[]>([
    "Unassigned", "Supermarket", "Farmers Market", "Specialty Store"
  ]);
  
  const { toast } = useToast();

  // Load from localStorage on mount
  useEffect(() => {
    const savedStores = localStorage.getItem('shoppingList_stores');
    const savedArchived = localStorage.getItem('shoppingList_archived');
    const savedItems = localStorage.getItem('shoppingList_allItems');
    
    if (savedStores) {
      setAvailableStores(JSON.parse(savedStores));
    }
    if (savedArchived) {
      setArchivedItems(JSON.parse(savedArchived));
    }
    if (savedItems) {
      setAllItems(JSON.parse(savedItems));
    }
  }, []);

  // Save to localStorage when state changes
  useEffect(() => {
    localStorage.setItem('shoppingList_stores', JSON.stringify(availableStores));
    localStorage.setItem('shoppingList_archived', JSON.stringify(archivedItems));
    localStorage.setItem('shoppingList_allItems', JSON.stringify(allItems));
  }, [availableStores, archivedItems, allItems]);

  // Generate shopping list from meals and merge with existing items
  useEffect(() => {
    console.log("useSimpleShoppingList: Regenerating list with", meals.length, "meals");
    
    let mealItems: GroceryItem[] = [];
    
    if (meals.length > 0) {
      const activeMeals = meals.filter(meal => meal.day && meal.day !== "");
      mealItems = generateShoppingList(activeMeals, pantryItems, []);
    }
    
    // Normalize all meal items
    const normalizedMealItems = mealItems.map(item => ({
      ...item,
      store: item.store || "Unassigned",
      id: `meal-${item.name}-${item.meal || 'default'}-${Date.now()}-${Math.random()}`,
      source: 'meal' as const
    }));

    // Merge with existing manual items (preserve store assignments)
    setAllItems(prevItems => {
      const manualItems = prevItems.filter(item => item.id.startsWith('manual-'));
      const combinedItems = [...normalizedMealItems, ...manualItems];
      
      console.log("useSimpleShoppingList: Combined items:", combinedItems.map(i => ({ 
        name: i.name, 
        store: i.store, 
        source: i.id.startsWith('manual-') ? 'manual' : 'meal' 
      })));
      
      return combinedItems;
    });
  }, [meals, pantryItems]);

  const updateItem = (updatedItem: GroceryItem) => {
    console.log("useSimpleShoppingList updateItem called:", updatedItem.name, "new store:", updatedItem.store);
    
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
