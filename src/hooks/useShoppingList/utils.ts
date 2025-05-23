
import { GroceryItem } from "@/types";
import { groceryCategories } from "@/utils/constants";

export const sortGroceryItems = (items: GroceryItem[]): GroceryItem[] => {
  return [...items].sort((a, b) => {
    // Normalize store values for consistent sorting
    const storeA = a.store || "Unassigned";
    const storeB = b.store || "Unassigned";
    
    if (storeA !== storeB) {
      if (storeA === "Unassigned") return 1;
      if (storeB === "Unassigned") return -1;
      return storeA.localeCompare(storeB);
    }
    
    // Then by department if available
    if (a.department && b.department && a.department !== b.department) {
      return a.department.localeCompare(b.department);
    }
    
    // Finally by category
    return a.category.localeCompare(b.category);
  });
};

export const findMatchingArchivedItem = (
  newItem: GroceryItem, 
  archivedItems: GroceryItem[]
): GroceryItem | undefined => {
  return archivedItems.find(item => 
    item.name.toLowerCase() === newItem.name.toLowerCase()
  );
};

export const shouldFilterFromShoppingList = (
  item: GroceryItem,
  archivedItems: GroceryItem[]
): boolean => {
  return archivedItems.some(archivedItem => 
    archivedItem.name.toLowerCase() === item.name.toLowerCase() && 
    (!item.meal || archivedItem.meal === item.meal)
  );
};
