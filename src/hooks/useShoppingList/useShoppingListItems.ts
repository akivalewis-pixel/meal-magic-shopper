
import { useMemo } from "react";
import { GroceryItem } from "@/types";

interface UseShoppingListItemsProps {
  mealItems: GroceryItem[];
  manualItems: GroceryItem[];
  itemOverrides: Map<string, Partial<GroceryItem>>;
  storeAssignments: React.MutableRefObject<Map<string, string>>;
}

export function useShoppingListItems({
  mealItems,
  manualItems,
  itemOverrides,
  storeAssignments
}: UseShoppingListItemsProps) {
  const combinedItems = useMemo(() => {
    const manualItemNames = new Set(manualItems.map(item => item.name.toLowerCase()));
    
    // Process meal items with overrides
    const enhancedMealItems = mealItems
      .filter(item => !manualItemNames.has(item.name.toLowerCase()))
      .map(item => {
        const savedStore = storeAssignments.current.get(item.name.toLowerCase());
        const overrides = itemOverrides.get(item.id) || {};
        
        return {
          ...item,
          ...overrides,
          store: overrides.store || savedStore || item.store || "Unassigned",
          checked: Boolean(overrides.checked) // Ensure boolean value
        };
      });
    
    // Combine all items
    const allCombined = [...enhancedMealItems, ...manualItems];
    
    // Filter out checked items more strictly
    const activeItems = allCombined.filter(item => {
      const isChecked = Boolean(item.checked);
      if (isChecked) {
        console.log("useShoppingListItems: Filtering out checked item:", item.name);
      }
      return !isChecked;
    });
    
    console.log("useShoppingListItems: Total items:", allCombined.length);
    console.log("useShoppingListItems: Active (unchecked) items:", activeItems.length);
    console.log("useShoppingListItems: Checked items filtered out:", allCombined.length - activeItems.length);
    
    return activeItems;
  }, [mealItems, manualItems, itemOverrides, storeAssignments]);

  return { combinedItems };
}
