
import React from "react";
import { ShoppingListContainer } from "./ShoppingListContainer";
import { useSimpleShoppingList } from "@/hooks/useShoppingList/useSimpleShoppingList";

interface NewShoppingListProps {
  meals: any[];
  pantryItems?: string[];
}

export const NewShoppingList = ({ meals, pantryItems = [] }: NewShoppingListProps) => {
  // Use the shopping list hook to get all the required data and functions
  const shoppingListHook = useSimpleShoppingList(meals, pantryItems);
  const { 
    groceryItems, 
    archivedItems,
    availableStores,
    updateItem,
    toggleItem,
    archiveItem,
    addItem,
    updateStores,
    resetList,
    getCurrentItems
  } = shoppingListHook;

  return (
    <ShoppingListContainer 
      meals={meals} 
      pantryItems={pantryItems}
      groceryItems={groceryItems}
      archivedItems={archivedItems}
      availableStores={availableStores}
      updateItem={updateItem}
      toggleItem={toggleItem}
      archiveItem={archiveItem}
      addItem={addItem}
      updateStores={updateStores}
      resetList={resetList}
      getCurrentItems={getCurrentItems}
    />
  );
};
