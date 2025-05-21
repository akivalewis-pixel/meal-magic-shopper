
import React, { useMemo } from "react";
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
    // Select which items array to use based on search mode
    const itemsToProcess = searchArchivedItems ? archivedItems : groceryItems;
    
    let filteredItems = itemsToProcess.filter(item => {
      const matchesSearch = searchTerm === "" || 
        item.name.toLowerCase().includes(searchTerm.toLowerCase());
      const shouldShow = showChecked || !item.checked;
      const matchesStore = selectedStore === "all" || 
        item.store === selectedStore || (!item.store && selectedStore === "Unassigned");
        
      return matchesSearch && shouldShow && matchesStore;
    });

    if (groupByStore) {
      // Group by store, then by department/category
      const byStore: Record<string, Record<string, GroceryItem[]>> = {};
      
      filteredItems.forEach(item => {
        const store = item.store || "Unassigned";
        let secondaryKey;
        
        if (sortBy === "department") {
          secondaryKey = item.department || "Unassigned";
        } else {
          secondaryKey = getCategoryLabel(item.category);
        }
        
        if (!byStore[store]) {
          byStore[store] = {};
        }
        
        if (!byStore[store][secondaryKey]) {
          byStore[store][secondaryKey] = [];
        }
        
        byStore[store][secondaryKey].push(item);
      });
      
      return byStore;
    } else {
      // Group by category or department
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
      
      return { "All Stores": byPrimary };
    }
  }, [groceryItems, archivedItems, searchArchivedItems, searchTerm, showChecked, selectedStore, groupByStore, sortBy]);
}
