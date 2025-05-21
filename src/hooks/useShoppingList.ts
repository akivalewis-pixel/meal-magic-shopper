
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { 
  GroceryItem,
  Meal
} from "@/types";
import { generateShoppingList } from "@/utils/groceryUtils";

export function useShoppingList(meals: Meal[], pantryItems: string[] = []) {
  const { toast } = useToast();
  const [groceryItems, setGroceryItems] = useState<GroceryItem[]>([]);
  const [recurringItems, setRecurringItems] = useState<GroceryItem[]>([]);
  const [archivedItems, setArchivedItems] = useState<GroceryItem[]>([]);
  const [manualItems, setManualItems] = useState<GroceryItem[]>([]);
  const [availableStores, setAvailableStores] = useState<string[]>([
    "Any Store", "Supermarket", "Farmers Market", "Specialty Store"
  ]);

  // Initialize with saved data
  useEffect(() => {
    const savedRecurringItems = localStorage.getItem('mealPlannerRecurringItems');
    const savedStores = localStorage.getItem('mealPlannerStores');
    const savedArchivedItems = localStorage.getItem('mealPlannerArchivedItems');
    const savedManualItems = localStorage.getItem('mealPlannerManualItems');
    
    const initialRecurringItems = savedRecurringItems ? JSON.parse(savedRecurringItems) : [];
    const initialStores = savedStores ? JSON.parse(savedStores) : ["Any Store", "Supermarket", "Farmers Market", "Specialty Store"];
    const initialArchivedItems = savedArchivedItems ? JSON.parse(savedArchivedItems) : [];
    const initialManualItems = savedManualItems ? JSON.parse(savedManualItems) : [];
    
    setRecurringItems(initialRecurringItems);
    setAvailableStores(initialStores);
    setArchivedItems(initialArchivedItems);
    setManualItems(initialManualItems);
  }, []);

  // Update shopping list when meals, pantry, or manual items change
  useEffect(() => {
    let shoppingList: GroceryItem[] = [];
    
    if (meals.length > 0) {
      // Only include meals that have a day assigned
      const activeMeals = meals.filter(meal => meal.day && meal.day !== "");
      shoppingList = generateShoppingList(activeMeals, pantryItems, recurringItems);
    } else {
      // If no meals, only show recurring items
      shoppingList = [...recurringItems];
    }
    
    // Add manually added items that aren't in the list already
    manualItems.forEach(manualItem => {
      const existingItem = shoppingList.find(item => 
        item.name.toLowerCase() === manualItem.name.toLowerCase() && 
        (!item.meal || item.meal === manualItem.meal)
      );
      
      if (!existingItem) {
        shoppingList.push(manualItem);
      }
    });
    
    // Filter out any items that are in the archived list
    const filteredShoppingList = shoppingList.filter(item => 
      !archivedItems.some(archivedItem => 
        archivedItem.name.toLowerCase() === item.name.toLowerCase() && 
        (!item.meal || archivedItem.meal === item.meal)
      )
    );
    
    setGroceryItems(filteredShoppingList);
  }, [meals, pantryItems, recurringItems, archivedItems, manualItems]);

  // Save to localStorage when state changes
  useEffect(() => {
    localStorage.setItem('mealPlannerRecurringItems', JSON.stringify(recurringItems));
    localStorage.setItem('mealPlannerStores', JSON.stringify(availableStores));
    localStorage.setItem('mealPlannerArchivedItems', JSON.stringify(archivedItems));
    localStorage.setItem('mealPlannerManualItems', JSON.stringify(manualItems));
  }, [recurringItems, availableStores, archivedItems, manualItems]);

  const handleToggleGroceryItem = (id: string) => {
    const updatedItems = groceryItems.map((item) =>
      item.id === id ? { ...item, checked: !item.checked } : item
    );
    setGroceryItems(updatedItems);
  };

  const handleUpdateGroceryItem = (updatedItem: GroceryItem) => {
    // Important: preserve all properties, especially store information
    setGroceryItems(prevItems =>
      prevItems.map(item =>
        item.id === updatedItem.id ? updatedItem : item
      )
    );
    
    // Update in manualItems if it exists there
    setManualItems(prevItems => {
      const existingIndex = prevItems.findIndex(item => item.id === updatedItem.id);
      if (existingIndex >= 0) {
        const newItems = [...prevItems];
        newItems[existingIndex] = updatedItem;
        return newItems;
      }
      return prevItems;
    });
    
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
    // Check if this item was previously archived
    const matchingArchivedItem = archivedItems.find(item => 
      item.name.toLowerCase() === newItem.name.toLowerCase()
    );

    if (matchingArchivedItem) {
      // Remove from archived items
      setArchivedItems(prev => 
        prev.filter(item => item.id !== matchingArchivedItem.id)
      );
      
      // Use some properties from the archived item
      newItem.category = matchingArchivedItem.category;
      if (matchingArchivedItem.store) newItem.store = matchingArchivedItem.store;
    }
    
    // Add to manual items
    setManualItems(prev => [...prev, newItem]);
    
    // Add to grocery items directly to ensure immediate visibility
    setGroceryItems(prevItems => [...prevItems, newItem]);
    
    toast({
      title: "Item Added",
      description: `${newItem.name} has been added to your shopping list`,
    });
  };
  
  const handleArchiveItem = (id: string) => {
    const itemToArchive = groceryItems.find(item => item.id === id);
    if (!itemToArchive) return;
    
    // Add the item to the archive with checked state
    setArchivedItems(prev => [...prev, {...itemToArchive, checked: true}]);
    
    // Remove the item from the current list
    setGroceryItems(prev => prev.filter(item => item.id !== id));
    
    // Remove from manual items if it exists there
    setManualItems(prev => prev.filter(item => item.id !== id));
    
    toast({
      title: "Item Archived",
      description: `${itemToArchive.name} has been moved to archive`,
    });
  };

  // New function to reset the shopping list
  const resetShoppingList = () => {
    // Keep recurring items but remove non-recurring items
    setGroceryItems(groceryItems.filter(item => item.recurring));
    setManualItems([]);
    
    toast({
      title: "Shopping List Reset",
      description: "Your shopping list has been reset. Recurring items kept.",
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
    archivedItems,
    resetShoppingList
  };
}
