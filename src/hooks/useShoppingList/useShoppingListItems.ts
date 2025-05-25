
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
        
        const enhancedItem = {
          ...item,
          ...overrides,
          store: overrides.store || savedStore || item.store || "Unassigned",
          checked: overrides.checked || false
        };
        
        // Debug logging for each item
        if (enhancedItem.checked) {
          console.log("useShoppingListItems: Found checked meal item:", enhancedItem.name, "checked:", enhancedItem.checked);
        }
        
        return enhancedItem;
      });
    
    // Debug manual items
    manualItems.forEach(item => {
      if (item.checked) {
        console.log("useShoppingListItems: Found checked manual item:", item.name, "checked:", item.checked);
      }
    });
    
    // Combine all items first
    const allCombined = [...enhancedMealItems, ...manualItems];
    
    // Debug all combined items
    const checkedItems = allCombined.filter(item => item.checked);
    console.log("useShoppingListItems: Total combined items:", allCombined.length);
    console.log("useShoppingListItems: Found checked items:", checkedItems.length);
    console.log("useShoppingListItems: Checked items details:", checkedItems.map(item => ({ name: item.name, checked: item.checked, id: item.id })));
    
    // Filter out ALL checked items - this should remove them completely
    const activeItems = allCombined.filter(item => {
      const isChecked = Boolean(item.checked);
      if (isChecked) {
        console.log("useShoppingListItems: Filtering out checked item:", item.name, "checked status:", item.checked);
      }
      return !isChecked;
    });
    
    console.log("useShoppingListItems: Active items (unchecked):", activeItems.length);
    console.log("useShoppingListItems: Checked items filtered out:", allCombined.length - activeItems.length);
    
    return activeItems;
  }, [mealItems, manualItems, itemOverrides, storeAssignments]);

  return { combinedItems };
}
