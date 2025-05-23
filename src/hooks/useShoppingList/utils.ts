
import { GroceryItem } from "@/types";

export const normalizeStoreValue = (store: string | undefined): string => {
  if (!store || store.trim() === "" || store === "undefined" || store === "null") {
    return "Unassigned";
  }
  return store.trim();
};

export const normalizeGroceryItem = (item: GroceryItem): GroceryItem => {
  return {
    ...item,
    store: normalizeStoreValue(item.store),
    __updateTimestamp: Date.now()
  };
};

export const sortGroceryItems = (items: GroceryItem[]): GroceryItem[] => {
  return [...items].sort((a, b) => {
    const storeA = normalizeStoreValue(a.store);
    const storeB = normalizeStoreValue(b.store);
    
    if (storeA !== storeB) {
      if (storeA === "Unassigned") return 1;
      if (storeB === "Unassigned") return -1;
      return storeA.localeCompare(storeB);
    }
    
    if (a.department && b.department && a.department !== b.department) {
      return a.department.localeCompare(b.department);
    }
    
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
