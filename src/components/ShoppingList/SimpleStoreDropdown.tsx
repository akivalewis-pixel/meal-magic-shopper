
import React, { useState, useCallback } from "react";
import { GroceryItem } from "@/types";

interface SimpleStoreDropdownProps {
  item: GroceryItem;
  availableStores: string[];
  onStoreChange: (item: GroceryItem, store: string) => void;
}

export const SimpleStoreDropdown = React.memo(({
  item,
  availableStores,
  onStoreChange
}: SimpleStoreDropdownProps) => {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStore = e.target.value;
    
    setIsUpdating(true);
    
    const updatedItem = { 
      ...item, 
      store: newStore,
      __updateTimestamp: Date.now()
    };
    
    onStoreChange(updatedItem, newStore);
    
    // Clear updating state quickly
    setTimeout(() => setIsUpdating(false), 200);
  }, [item, onStoreChange]);

  const currentStore = item.store || "Unassigned";

  return (
    <div className="relative">
      <select
        value={currentStore}
        onChange={handleChange}
        className={`w-32 h-8 text-xs bg-white border rounded px-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
          isUpdating 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300'
        }`}
        disabled={isUpdating}
      >
        <option value="Unassigned">Unassigned</option>
        {availableStores
          .filter(store => store !== "Unassigned")
          .map(store => (
            <option key={store} value={store}>
              {store}
            </option>
          ))}
      </select>
      {isUpdating && (
        <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
      )}
    </div>
  );
});

SimpleStoreDropdown.displayName = 'SimpleStoreDropdown';
