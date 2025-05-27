
import { useState } from "react";
import { GroceryItem } from "@/types";

export function useShoppingListItemsState(initialItems: GroceryItem[], initialArchived: GroceryItem[]) {
  const [groceryItems, setGroceryItems] = useState<GroceryItem[]>(initialItems);
  const [archivedItems, setArchivedItems] = useState<GroceryItem[]>(initialArchived);

  return {
    groceryItems,
    archivedItems,
    setGroceryItems,
    setArchivedItems
  };
}
