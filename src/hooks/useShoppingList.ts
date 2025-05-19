
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { 
  GroceryItem,
  Meal
} from "@/types";
import { generateShoppingList } from "@/utils/groceryUtils";

export function useShoppingList(meals: Meal[], pantryItems: string[]) {
  const { toast } = useToast();
  const [groceryItems, setGroceryItems] = useState<GroceryItem[]>([]);
  const [recurringItems, setRecurringItems] = useState<GroceryItem[]>([]);
  const [archivedItems, setArchivedItems] = useState<GroceryItem[]>([]);
  const [availableStores, setAvailableStores] = useState<string[]>([
    "Any Store", "Supermarket", "Farmers Market", "Specialty Store"
  ]);

  // Initialize with saved data
  useEffect(() => {
    const savedRecurringItems = localStorage.getItem('mealPlannerRecurringItems');
    const savedStores = localStorage.getItem('mealPlannerStores');
    const savedArchivedItems = localStorage.getItem('mealPlannerArchivedItems');
    
    const initialRecurringItems = savedRecurringItems ? JSON.parse(savedRecurringItems) : [];
    const initialStores = savedStores ? JSON.parse(savedStores) : ["Any Store", "Supermarket", "Farmers Market", "Specialty Store"];
    const initialArchivedItems = savedArchivedItems ? JSON.parse(savedArchivedItems) : [];
    
    setRecurringItems(initialRecurringItems);
    setAvailableStores(initialStores);
    setArchivedItems(initialArchivedItems);
  }, []);

  // Update shopping list when meals or pantry changes
  useEffect(() => {
    if (meals.length > 0) {
      // Only include meals that have a day assigned
      const activeMeals = meals.filter(meal => meal.day && meal.day !== "");
      const shoppingList = generateShoppingList(activeMeals, pantryItems, recurringItems);
      
      // Filter out any items that are in the archived list
      const filteredShoppingList = shoppingList.filter(item => 
        !archivedItems.some(archivedItem => 
          archivedItem.name.toLowerCase() === item.name.toLowerCase() && 
          (!item.meal || archivedItem.meal === item.meal)
        )
      );
      
      setGroceryItems(filteredShoppingList);
    }
  }, [meals, pantryItems, recurringItems, archivedItems]);

  // Save to localStorage when state changes
  useEffect(() => {
    if (recurringItems.length > 0) {
      localStorage.setItem('mealPlannerRecurringItems', JSON.stringify(recurringItems));
    }
    if (availableStores.length > 0) {
      localStorage.setItem('mealPlannerStores', JSON.stringify(availableStores));
    }
    if (archivedItems.length > 0) {
      localStorage.setItem('mealPlannerArchivedItems', JSON.stringify(archivedItems));
    }
  }, [recurringItems, availableStores, archivedItems]);

  const handleToggleGroceryItem = (id: string) => {
    setGroceryItems(prevItems =>
      prevItems.map((item) =>
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    );
  };

  const handleUpdateGroceryItem = (updatedItem: GroceryItem) => {
    // Important: preserve all properties, especially store information
    setGroceryItems(prevItems =>
      prevItems.map(item =>
        item.id === updatedItem.id ? updatedItem : item
      )
    );
    
    // If the item is marked as recurring, add/update it in the recurring items list
    if (updatedItem.recurring) {
      setRecurringItems(prevItems => {
        const existingItem = prevItems.find(item => item.id === updatedItem.id);
        if (existingItem) {
          return prevItems.map(item =>
            item.id === updatedItem.id ? updatedItem : item
          );
        } else {
          return [...prevItems, updatedItem];
        }
      });
    } else {
      // If the item is marked as not recurring, remove it from recurring items
      setRecurringItems(prevItems =>
        prevItems.filter(item => item.id !== updatedItem.id)
      );
    }
  };

  const handleUpdateStores = (stores: string[]) => {
    setAvailableStores(stores);
    toast({
      title: "Stores Updated",
      description: `Your store list has been updated`,
    });
  };
  
  const handleAddGroceryItem = (newItem: GroceryItem) => {
    setGroceryItems(prevItems => [...prevItems, newItem]);
    toast({
      title: "Item Added",
      description: `${newItem.name} has been added to your shopping list`,
    });
  };
  
  const handleArchiveItem = (id: string) => {
    const itemToArchive = groceryItems.find(item => item.id === id);
    if (!itemToArchive) return;
    
    // Add the item to the archive
    setArchivedItems(prev => [...prev, itemToArchive]);
    
    // Remove the item from the current list
    setGroceryItems(prev => prev.filter(item => item.id !== id));
    
    toast({
      title: "Item Archived",
      description: `${itemToArchive.name} has been archived`,
    });
  };

  return {
    groceryItems,
    availableStores,
    handleToggleGroceryItem,
    handleUpdateGroceryItem,
    handleUpdateStores,
    handleAddGroceryItem,
    handleArchiveItem,
    archivedItems
  };
}
