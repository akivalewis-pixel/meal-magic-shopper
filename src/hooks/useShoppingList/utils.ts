
import { GroceryItem } from "@/types";
import { groceryCategories } from "@/utils/constants";

export const normalizeStoreValue = (store: string | undefined): string => {
  // Convert empty strings, undefined, and null values to "Unassigned"
  if (!store || store.trim() === "" || store === "undefined" || store === "null") {
    console.log("Normalizing empty store to Unassigned");
    return "Unassigned";
  }
  console.log(`Normalized store: '${store}' -> '${store}'`);
  return store;
};

export const normalizeGroceryItem = (item: GroceryItem): GroceryItem => {
  const normalizedItem = {
    ...item,
    store: normalizeStoreValue(item.store)
  };
  console.log(`Normalized item ${item.name} store: '${item.store}' -> '${normalizedItem.store}'`);
  return normalizedItem;
};

export const sortGroceryItems = (items: GroceryItem[]): GroceryItem[] => {
  console.log("Sorting grocery items...");
  
  // Create a completely new array to avoid mutation issues
  return [...items].sort((a, b) => {
    // Always normalize store values for consistent comparison
    const storeA = normalizeStoreValue(a.store);
    const storeB = normalizeStoreValue(b.store);
    
    console.log(`Comparing ${a.name}(${storeA}) with ${b.name}(${storeB})`);
    
    if (storeA !== storeB) {
      // Unassigned always comes last
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
