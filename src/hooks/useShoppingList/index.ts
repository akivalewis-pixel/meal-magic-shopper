
import { useState, useEffect } from "react";
import { GroceryItem, Meal } from "@/types";
import { generateShoppingList } from "@/utils/groceryUtils";
import { useShoppingListStorage } from "./useShoppingListStorage";
import { useShoppingListActions } from "./useShoppingListActions";
import { sortGroceryItems, shouldFilterFromShoppingList, normalizeGroceryItem } from "./utils";

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
    
    // Normalize all items from meals to ensure consistent store values
    shoppingList = shoppingList.map(normalizeGroceryItem);
    
    // Add manually added items that aren't in the list already
    manualItems.forEach(manualItem => {
      const normalizedManualItem = normalizeGroceryItem(manualItem);
      const existingItem = shoppingList.find(item => 
        item.name.toLowerCase() === normalizedManualItem.name.toLowerCase() && 
        (!item.meal || item.meal === normalizedManualItem.meal)
      );
      
      if (!existingItem) {
        shoppingList.push(normalizedManualItem);
      }
    });
    
    // Filter out any items that are in the archived list
    const filteredShoppingList = shoppingList.filter(item => 
      !shouldFilterFromShoppingList(item, archivedItems)
    );
    
    console.log("useShoppingList - Final shopping list with normalized stores:", 
      filteredShoppingList.map(item => ({ name: item.name, store: item.store })));
    
    setGroceryItems(sortGroceryItems(filteredShoppingList));
  }, [meals, pantryItems, archivedItems, manualItems]);

  return {
    groceryItems,
    availableStores,
    archivedItems,
    ...actions
  };
}
