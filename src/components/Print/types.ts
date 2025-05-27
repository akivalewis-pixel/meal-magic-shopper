
import { Meal, GroceryItem } from "@/types";

export interface PrintButtonProps {
  meals: Meal[];
  groceryItems: GroceryItem[];
  getCurrentItems?: () => GroceryItem[];
}

export interface PrintData {
  meals: Meal[];
  groceryItems: GroceryItem[];
}

export interface GroupedItems {
  [store: string]: {
    [category: string]: GroceryItem[];
  };
}
