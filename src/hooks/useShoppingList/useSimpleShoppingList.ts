import { useState, useEffect } from "react";
import { GroceryItem, Meal } from "@/types";
import { generateShoppingList } from "@/utils/groceryUtils";
import { useToast } from "@/hooks/use-toast";

export function useSimpleShoppingList(meals: Meal[], pantryItems: string[] = []) {
  const [groceryItems, setGroceryItems] = useState<GroceryItem[]>([]);
  const [manualItems, setManualItems] = useState<GroceryItem[]>([]);
  const [archivedItems, setArchivedItems] = useState<GroceryItem[]>([]);
  const [availableStores, setAvailableStores] = useState<string[]>([
    "Unassigned", "Supermarket", "Farmers Market", "Specialty Store"
  ]);
  
  const { toast } = useToast();

  // Load from localStorage on mount
  useEffect(() => {
    const savedStores = localStorage.getItem('shoppingList_stores');
    const savedArchived = localStorage.getItem('shoppingList_archived');
    const savedManual = localStorage.getItem('shoppingList_manual');
    
    if (savedStores) {
      setAvailableStores(JSON.parse(savedStores));
    }
    if (savedArchived) {
      setArchivedItems(JSON.parse(savedArchived));
    }
    if (savedManual) {
      setManualItems(JSON.parse(savedManual));
    }
  }, []);

  // Save to localStorage when state changes
  useEffect(() => {
    localStorage.setItem('shoppingList_stores', JSON.stringify(availableStores));
    localStorage.setItem('shoppingList_archived', JSON.stringify(archivedItems));
    localStorage.setItem('shoppingList_manual', JSON.stringify(manualItems));
  }, [availableStores, archivedItems, manualItems]);

  // Generate shopping list from meals and merge with manual items
  useEffect(() => {
    console.log("useSimpleShoppingList: Regenerating list with", meals.length, "meals and", manualItems.length, "manual items");
    
    let mealItems: GroceryItem[] = [];
    
    if (meals.length > 0) {
      const activeMeals = meals.filter(meal => meal.day && meal.day !== "");
      mealItems = generateShoppingList(activeMeals, pantryItems, []);
    }
    
    // Normalize all meal items to have proper store values
    const normalizedMealItems = mealItems.map(item => ({
      ...item,
      store: item.store || "Unassigned",
      id: `meal-${item.name}-${item.meal || 'default'}-${Date.now()}-${Math.random()}`
    }));

    // Combine meal items with manual items
    const allItems = [...normalizedMealItems, ...manualItems];
    
    console.log("useSimpleShoppingList: Combined items:", allItems.map(i => ({ name: i.name, store: i.store, source: i.id.startsWith('manual-') ? 'manual' : 'meal' })));

    setGroceryItems(allItems);
  }, [meals, pantryItems, manualItems]);

  const updateItem = (updatedItem: GroceryItem) => {
    console.log("useSimpleShoppingList updateItem called:", updatedItem.name, "new store:", updatedItem.store);
    
    // Create a completely new item object to force React re-render
    const finalUpdatedItem = {
      ...updatedItem,
      store: updatedItem.store || "Unassigned",
      __updateTimestamp: Date.now()
    };
    
    console.log("useSimpleShoppingList: Final updated item:", finalUpdatedItem);
    
    setGroceryItems(prevItems => {
      const newItems = prevItems.map(item => {
        if (item.id === finalUpdatedItem.id) {
          console.log("useSimpleShoppingList: Found matching item, updating:", item.name, "from store:", item.store, "to store:", finalUpdatedItem.store);
          return finalUpdatedItem;
        }
        return item;
      });
      
      console.log("useSimpleShoppingList: New items after update:", newItems.map(i => ({ name: i.name, store: i.store })));
      return newItems;
    });

    // Also update manual items if this is a manual item
    if (finalUpdatedItem.id.startsWith('manual-')) {
      setManualItems(prevManual => 
        prevManual.map(item => 
          item.id === finalUpdatedItem.id ? finalUpdatedItem : item
        )
      );
    }

    toast({
      title: "Item Updated", 
      description: `${finalUpdatedItem.name} ${finalUpdatedItem.store !== "Unassigned" ? `moved to ${finalUpdatedItem.store}` : 'updated'}`,
    });
  };

  const toggleItem = (id: string) => {
    setGroceryItems(prev => 
      prev.map(item => 
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    );
  };

  const archiveItem = (id: string) => {
    const item = groceryItems.find(i => i.id === id);
    if (!item) return;

    setArchivedItems(prev => [...prev, { ...item, checked: true }]);
    setGroceryItems(prev => prev.filter(i => i.id !== id));
    
    // Remove from manual items if it's a manual item
    if (item.id.startsWith('manual-')) {
      setManualItems(prev => prev.filter(i => i.id !== id));
    }
    
    toast({
      title: "Item Archived",
      description: `${item.name} moved to archive`,
    });
  };

  const addItem = (newItem: GroceryItem) => {
    const itemWithId = {
      ...newItem,
      id: `manual-${Date.now()}-${Math.random()}`,
      store: newItem.store || "Unassigned"
    };
    
    console.log("useSimpleShoppingList: Adding manual item:", itemWithId);
    
    setManualItems(prev => [...prev, itemWithId]);
    
    toast({
      title: "Item Added",
      description: `${newItem.name} added to shopping list`,
    });
  };

  const updateStores = (newStores: string[]) => {
    setAvailableStores(newStores);
    
    // Update items that have invalid stores
    setGroceryItems(prev => 
      prev.map(item => {
        if (item.store && !newStores.includes(item.store)) {
          return { ...item, store: "Unassigned" };
        }
        return item;
      })
    );
    
    setManualItems(prev => 
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
    const itemsToArchive = groceryItems.map(item => ({
      ...item,
      checked: true,
      id: `archived-${Date.now()}-${item.id}`
    }));
    
    setArchivedItems(prev => [...prev, ...itemsToArchive]);
    setGroceryItems([]);
    setManualItems([]);
    
    toast({
      title: "List Reset",
      description: `${itemsToArchive.length} items archived`,
    });
  };

  return {
    groceryItems,
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
