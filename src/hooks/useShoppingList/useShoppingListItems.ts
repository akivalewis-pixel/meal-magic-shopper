
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
    
    // Process meal items with overrides, filter out checked items
    const enhancedMealItems = mealItems
      .filter(item => !manualItemNames.has(item.name.toLowerCase()))
      .map(item => {
        const savedStore = storeAssignments.current.get(item.name.toLowerCase());
        const overrides = itemOverrides.get(item.id) || {};
        
        return {
          ...item,
          ...overrides,
          store: overrides.store || savedStore || item.store || "Unassigned",
          checked: overrides.checked || false
        };
      })
      .filter(item => !item.checked); // Filter out checked meal items
    
    // Filter out checked manual items
    const activeManualItems = manualItems.filter(item => !item.checked);
    
    const combined = [...enhancedMealItems, ...activeManualItems];
    
    console.log("useShoppingListItems: Combined items count:", combined.length);
    console.log("useShoppingListItems: Checked items filtered out:", 
      mealItems.filter(item => {
        const overrides = itemOverrides.get(item.id) || {};
        return overrides.checked;
      }).length + manualItems.filter(item => item.checked).length
    );
    
    return combined;
  }, [mealItems, manualItems, itemOverrides, storeAssignments]);

  return { combinedItems };
}
