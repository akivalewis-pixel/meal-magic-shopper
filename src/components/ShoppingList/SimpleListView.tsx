
import React, { useMemo, useCallback } from "react";
import { GroceryItem } from "@/types";
import { ItemRow } from "./ItemRow";
import { CategoryHeader } from "./CategoryHeader";
import { useCustomCategories } from "./useCustomCategories";
import { useIsMobile } from "@/hooks/use-mobile";

interface SimpleListViewProps {
  items: GroceryItem[];
  availableStores: string[];
  onUpdateItem: (item: GroceryItem) => void;
  onToggleItem: (id: string) => void;
  groupByStore: boolean;
  customCategoryNames?: Record<string, string>;
  onCategoryNameChange?: (oldName: string, newName: string) => void;
}

export const SimpleListView = React.memo(({
  items,
  availableStores,
  onUpdateItem,
  onToggleItem,
  groupByStore,
  customCategoryNames = {},
  onCategoryNameChange
}: SimpleListViewProps) => {
  const isMobile = useIsMobile();
  const { customCategories, addCustomCategory } = useCustomCategories();
  
  // Items should only include unchecked items
  const activeItems = items.filter(item => !item.checked);
  console.log("SimpleListView: Displaying", activeItems.length, "active items out of", items.length, "total items");

  // Function to get the display category name (custom or default) - simplified
  const getDisplayCategoryName = useCallback((categoryName: string): string => {
    console.log("SimpleListView: Getting display name for category:", categoryName, "Custom names:", customCategoryNames);
    
    // Try exact match first
    if (customCategoryNames[categoryName]) {
      console.log("SimpleListView: Found exact match:", customCategoryNames[categoryName]);
      return customCategoryNames[categoryName];
    }
    
    // Return capitalized version as default
    const displayName = categoryName.charAt(0).toUpperCase() + categoryName.slice(1);
    console.log("SimpleListView: Using default display name:", displayName);
    return displayName;
  }, [customCategoryNames]);

  // Optimized grouping with stable keys and memoization
  const groupedItems = useMemo(() => {
    console.log("SimpleListView: Grouping items", { groupByStore, itemCount: activeItems.length });
    console.log("SimpleListView: Custom category names:", customCategoryNames);
    
    const currentGrouping: Record<string, Record<string, GroceryItem[]>> = {};
    
    if (groupByStore) {
      activeItems.forEach(item => {
        const store = item.store || "Unassigned";
        const category = item.category;
        
        if (!currentGrouping[store]) {
          currentGrouping[store] = {};
        }
        if (!currentGrouping[store][category]) {
          currentGrouping[store][category] = [];
        }
        currentGrouping[store][category].push(item);
      });
      
      // Sort items within each category by name
      Object.keys(currentGrouping).forEach(store => {
        Object.keys(currentGrouping[store]).forEach(category => {
          currentGrouping[store][category].sort((a, b) => a.name.localeCompare(b.name));
        });
      });
      
      console.log("SimpleListView: Grouped by store", Object.keys(currentGrouping));
    } else {
      // Group by category only
      const categoryGrouping: Record<string, GroceryItem[]> = {};
      activeItems.forEach(item => {
        const category = item.category;
        if (!categoryGrouping[category]) {
          categoryGrouping[category] = [];
        }
        categoryGrouping[category].push(item);
      });
      
      // Sort items within each category by name
      Object.keys(categoryGrouping).forEach(category => {
        categoryGrouping[category].sort((a, b) => a.name.localeCompare(b.name));
      });
      
      currentGrouping["All Items"] = categoryGrouping;
    }
    
    return currentGrouping;
  }, [activeItems, groupByStore, customCategoryNames]);

  if (activeItems.length === 0) {
    return (
      <div className="text-center py-10 text-gray-500">
        <p>No active items in your shopping list</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {Object.entries(groupedItems).map(([storeName, storeCategories]) => (
        <div key={storeName} className={isMobile ? "pb-2" : ""}>
          {groupByStore && (
            <h3 className="text-lg font-semibold mb-3 pb-1 border-b border-gray-200 text-left">
              {storeName} ({Object.values(storeCategories).flat().length} items)
            </h3>
          )}
          
          {Object.entries(storeCategories).map(([categoryName, categoryItems]) => (
            <div key={`${storeName}-${categoryName}`} className="mb-3 sm:mb-4">
              <CategoryHeader
                categoryName={getDisplayCategoryName(categoryName)}
                originalCategoryName={categoryName}
                customCategoryNames={customCategoryNames}
                onCategoryNameChange={onCategoryNameChange}
                itemCount={categoryItems.length}
              />
              <ul className={`space-y-${isMobile ? "2" : "1"}`}>
                {categoryItems.map(item => (
                  <ItemRow
                    key={`${item.id}-${item.category}-${item.store}-${item.__updateTimestamp || 0}`}
                    item={item}
                    onUpdateItem={onUpdateItem}
                    onToggleItem={onToggleItem}
                    availableStores={availableStores}
                    customCategories={customCategories}
                    onAddCustomCategory={addCustomCategory}
                  />
                ))}
              </ul>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
});

SimpleListView.displayName = 'SimpleListView';
