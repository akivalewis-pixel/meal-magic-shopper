
import { Meal } from "@/types";
import { useSimplifiedShoppingList } from "./useSimplifiedShoppingList";

export function useSimpleShoppingList(meals: Meal[], pantryItems: string[] = []) {
  const shoppingListData = useSimplifiedShoppingList(meals, pantryItems);
  
  // Enhanced getCurrentItems that ensures we get the absolute latest state
  const getCurrentItems = () => {
    console.log("useSimpleShoppingList: getCurrentItems called");
    
    // Force a fresh calculation by calling the hook's internal getCurrentItems
    const currentItems = shoppingListData.getCurrentItems();
    
    console.log("useSimpleShoppingList: Returning", currentItems.length, "current items");
    console.log("useSimpleShoppingList: Current items details:", currentItems.map(item => ({
      id: item.id,
      name: item.name,
      checked: item.checked,
      store: item.store,
      category: item.category,
      quantity: item.quantity
    })));
    
    return currentItems;
  };
  
  return {
    ...shoppingListData,
    getCurrentItems
  };
}
