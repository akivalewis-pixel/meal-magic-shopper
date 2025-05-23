import { useState, useEffect } from "react";
import { GroceryItem, Meal } from "@/types";
import { generateShoppingList } from "@/utils/groceryUtils";
import { useToast } from "@/hooks/use-toast";

export function useSimpleShoppingList(meals: Meal[], pantryItems: string[] = []) {
  const [groceryItems, setGroceryItems] = useState<GroceryItem[]>([]);
  const [archivedItems, setArchivedItems] = useState<GroceryItem[]>([]);
  const [availableStores, setAvailableStores] = useState<string[]>([
    "Unassigned", "Supermarket", "Farmers Market", "Specialty Store"
  ]);
  
  const { toast } = useToast();

  // Load from localStorage on mount
  useEffect(() => {
    const savedStores = localStorage.getItem('shoppingList_stores');
    const savedArchived = localStorage.getItem('shoppingList_archived');
    
    if (savedStores) {
      setAvailableStores(JSON.parse(savedStores));
    }
    if (savedArchived) {
      setArchivedItems(JSON.parse(savedArchived));
    }
  }, []);

  // Save to localStorage when state changes
  useEffect(() => {
    localStorage.setItem('shoppingList_stores', JSON.stringify(availableStores));
    localStorage.setItem('shoppingList_archived', JSON.stringify(archivedItems));
  }, [availableStores, archivedItems]);

  // Generate shopping list from meals
  useEffect(() => {
    if (meals.length === 0) {
      setGroceryItems([]);
      return;
    }

    const activeMeals = meals.filter(meal => meal.day && meal.day !== "");
    const newItems = generateShoppingList(activeMeals, pantryItems, []);
    
    // Normalize all items to have proper store values
    const normalizedItems = newItems.map(item => ({
      ...item,
      store: item.store || "Unassigned",
      id: `${item.name}-${item.meal || 'default'}-${Date.now()}`
    }));

    setGroceryItems(normalizedItems);
  }, [meals, pantryItems]);

  const updateItem = (updatedItem: GroceryItem) => {
    console.log("updateItem called:", updatedItem.name, "new store:", updatedItem.store);
    
    setGroceryItems(prev => {
      const newItems = prev.map(item => {
        if (item.id === updatedItem.id) {
          console.log("Updating item:", item.name, "from store:", item.store, "to store:", updatedItem.store);
          return { ...updatedItem };
        }
        return item;
      });
      
      console.log("Updated grocery items:", newItems.map(i => ({ name: i.name, store: i.store })));
      return newItems;
    });

    toast({
      title: "Item Updated", 
      description: `${updatedItem.name} ${updatedItem.store !== "Unassigned" ? `moved to ${updatedItem.store}` : 'updated'}`,
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
    
    setGroceryItems(prev => [...prev, itemWithId]);
    
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
