
import { useState, useEffect } from "react";
import { GroceryItem, Meal } from "@/types";
import { generateShoppingList } from "@/utils/groceryUtils";
import { useShoppingListStorage } from "./useShoppingListStorage";
import { useShoppingListActions } from "./useShoppingListActions";
import { sortGroceryItems, shouldFilterFromShoppingList } from "./utils";

export function useShoppingList(meals: Meal[], pantryItems: string[] = []) {
  const [groceryItems, setGroceryItems] = useState<GroceryItem[]>([]);
  
  const {
    archivedItems,
    setArchivedItems,
    manualItems,
    setManualItems,
    availableStores,
    setAvailableStores
  } = useShoppingListStorage();

  const actions = useShoppingListActions({
    groceryItems,
    setGroceryItems,
    archivedItems,
    setArchivedItems,
    manualItems,
    setManualItems,
    availableStores,
    setAvailableStores
  });

  // Update shopping list when meals, pantry, or manual items change
  useEffect(() => {
    let shoppingList: GroceryItem[] = [];
    
    if (meals.length > 0) {
      // Only include meals that have a day assigned
      const activeMeals = meals.filter(meal => meal.day && meal.day !== "");
      shoppingList = generateShoppingList(activeMeals, pantryItems, []);
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
      !shouldFilterFromShoppingList(item, archivedItems)
    );
    
    setGroceryItems(sortGroceryItems(filteredShoppingList));
  }, [meals, pantryItems, archivedItems, manualItems]);

  return {
    groceryItems,
    availableStores,
    archivedItems,
    ...actions
  };
}
