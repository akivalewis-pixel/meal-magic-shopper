
import React from "react";
import { ShoppingListContainer } from "./ShoppingListContainer";

interface NewShoppingListProps {
  meals: any[];
  pantryItems?: string[];
}

export const NewShoppingList = ({ meals, pantryItems = [] }: NewShoppingListProps) => {
  return <ShoppingListContainer meals={meals} pantryItems={pantryItems} />;
};
