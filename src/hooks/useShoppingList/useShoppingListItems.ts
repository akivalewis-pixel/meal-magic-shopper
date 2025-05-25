
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
          checked: overrides.checked || false
        };
      });
    
    // Combine all items first
    const allCombined = [...enhancedMealItems, ...manualItems];
    
    // Filter out ALL checked items - this is the key fix
    const activeItems = allCombined.filter(item => !item.checked);
    
    console.log("useShoppingListItems: Total combined items:", allCombined.length);
    console.log("useShoppingListItems: Active items (unchecked):", activeItems.length);
    console.log("useShoppingListItems: Checked items filtered out:", allCombined.length - activeItems.length);
    
    return activeItems;
  }, [mealItems, manualItems, itemOverrides, storeAssignments]);

  return { combinedItems };
}
