
import { useState, useCallback } from "react";
import { GroceryItem } from "@/types";

export function useShoppingListOverrides() {
  const [itemOverrides, setItemOverrides] = useState<Map<string, Partial<GroceryItem>>>(new Map());

  const updateOverride = useCallback((id: string, overrideData: Partial<GroceryItem>) => {
    setItemOverrides(prev => {
      const newOverrides = new Map(prev);
      newOverrides.set(id, {
        ...overrideData,
        __updateTimestamp: Date.now()
      });
      return newOverrides;
    });
  }, []);

  const clearOverride = useCallback((id: string) => {
    setItemOverrides(prev => {
      const newOverrides = new Map(prev);
      newOverrides.delete(id);
      return newOverrides;
    });
  }, []);

  const loadOverrides = useCallback((savedItems: GroceryItem[]) => {
    const savedOverrides = new Map<string, Partial<GroceryItem>>();
    savedItems.forEach((item: GroceryItem) => {
      if (item.id.includes('-') && !item.id.startsWith('manual-')) {
        savedOverrides.set(item.id, {
          name: item.name,
          quantity: item.quantity,
          category: item.category,
          store: item.store,
          checked: item.checked,
          __updateTimestamp: item.__updateTimestamp
        });
      }
    });
    setItemOverrides(savedOverrides);
  }, []);

  return {
    itemOverrides,
    updateOverride,
    clearOverride,
    loadOverrides,
    setItemOverrides
  };
}
