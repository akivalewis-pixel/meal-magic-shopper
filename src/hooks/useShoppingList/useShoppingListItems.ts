
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
      .filter(item => !item.checked);
    
    // Add active manual items (not checked)
    const activeManualItems = manualItems.filter(item => !item.checked);
    
    return [...enhancedMealItems, ...activeManualItems];
  }, [mealItems, manualItems, itemOverrides, storeAssignments]);

  return { combinedItems };
}
