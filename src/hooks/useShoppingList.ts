
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { 
  GroceryItem,
  Meal
} from "@/types";
import { generateShoppingList } from "@/utils/mealPlannerUtils";

export function useShoppingList(meals: Meal[], pantryItems: string[]) {
  const { toast } = useToast();
  const [groceryItems, setGroceryItems] = useState<GroceryItem[]>([]);
  const [recurringItems, setRecurringItems] = useState<GroceryItem[]>([]);
  const [availableStores, setAvailableStores] = useState<string[]>([
    "Any Store", "Supermarket", "Farmers Market", "Specialty Store"
  ]);

  // Initialize with saved data
  useEffect(() => {
    const savedRecurringItems = localStorage.getItem('mealPlannerRecurringItems');
    const savedStores = localStorage.getItem('mealPlannerStores');
    
    const initialRecurringItems = savedRecurringItems ? JSON.parse(savedRecurringItems) : [];
    const initialStores = savedStores ? JSON.parse(savedStores) : ["Any Store", "Supermarket", "Farmers Market", "Specialty Store"];
    
    setRecurringItems(initialRecurringItems);
    setAvailableStores(initialStores);
  }, []);

  // Update shopping list when meals or pantry changes
  useEffect(() => {
    if (meals.length > 0) {
      // Only include meals that have a day assigned
      const activeMeals = meals.filter(meal => meal.day && meal.day !== "");
      const shoppingList = generateShoppingList(activeMeals, pantryItems, recurringItems);
      setGroceryItems(shoppingList);
    }
  }, [meals, pantryItems, recurringItems]);

  // Save to localStorage when state changes
  useEffect(() => {
    if (recurringItems.length > 0) {
      localStorage.setItem('mealPlannerRecurringItems', JSON.stringify(recurringItems));
    }
    if (availableStores.length > 0) {
      localStorage.setItem('mealPlannerStores', JSON.stringify(availableStores));
    }
  }, [recurringItems, availableStores]);

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

  return {
    groceryItems,
    availableStores,
    handleToggleGroceryItem,
    handleUpdateGroceryItem,
    handleUpdateStores
  };
}
