
import { useMemo } from "react";
import { GroceryItem, GroceryCategory } from "@/types";
import { groceryCategories } from "@/utils/constants";

// Helper functions
const getCategoryLabel = (category: GroceryCategory): string => {
  return groceryCategories.find(c => c.value === category)?.label || "Other";
};

export function useShoppingListGrouping(
  groceryItems: GroceryItem[],
  archivedItems: GroceryItem[],
  searchArchivedItems: boolean,
  searchTerm: string,
  showChecked: boolean,
  selectedStore: string,
  groupByStore: boolean,
  sortBy: "store" | "department" | "category"
) {
  return useMemo(() => {
    console.log("useShoppingListGrouping called with", {
      itemsCount: groceryItems.length,
      searchTerm,
      showChecked,
      selectedStore,
      groupByStore,
      sortBy
    });
    
    // Select which items array to use based on search mode
    const itemsToProcess = searchArchivedItems ? archivedItems : groceryItems;
    
    // Debug log to see what items we're processing
    console.log("Processing items:", itemsToProcess.map(item => ({
      name: item.name,
      store: item.store || "Unassigned",
      category: item.category,
      department: item.department || "Unassigned"
    })));
    
    // Filter items based on search, checked status, and store
    let filteredItems = itemsToProcess.filter(item => {
      const matchesSearch = searchTerm === "" || 
        item.name.toLowerCase().includes(searchTerm.toLowerCase());
      const shouldShow = showChecked || !item.checked;
      
      // Handle store filtering, with special case for "Unassigned" items
      const matchesStore = selectedStore === "all" || 
        (selectedStore === "Unassigned" ? !item.store : item.store === selectedStore);
        
      return matchesSearch && shouldShow && matchesStore;
    });

    // Group items by store and then by department/category
    if (groupByStore) {
      const byStore: Record<string, Record<string, GroceryItem[]>> = {};
      
      filteredItems.forEach(item => {
        // Use "Unassigned" if no store is selected
        const store = item.store || "Unassigned";
        let secondaryKey;
        
        // Choose grouping method based on sortBy
        if (sortBy === "department") {
          secondaryKey = item.department || "Unassigned";
        } else {
          secondaryKey = getCategoryLabel(item.category);
        }
        
        // Initialize store and category objects if they don't exist
        if (!byStore[store]) {
          byStore[store] = {};
        }
        
        if (!byStore[store][secondaryKey]) {
          byStore[store][secondaryKey] = [];
        }
        
        byStore[store][secondaryKey].push(item);
      });
      
      console.log("Grouped items by store:", Object.keys(byStore));
      return byStore;
    } else {
      // Group by category or department only
      const byPrimary: Record<string, GroceryItem[]> = {};
      
      filteredItems.forEach(item => {
        let primaryKey;
        
        if (sortBy === "department") {
          primaryKey = item.department || "Unassigned";
        } else {
          primaryKey = getCategoryLabel(item.category);
        }
        
        if (!byPrimary[primaryKey]) {
          byPrimary[primaryKey] = [];
        }
        
        byPrimary[primaryKey].push(item);
      });
      
      console.log("Grouped items by category/department:", Object.keys(byPrimary));
      return { "All Stores": byPrimary };
    }
  }, [groceryItems, archivedItems, searchArchivedItems, searchTerm, showChecked, selectedStore, groupByStore, sortBy]);
}
