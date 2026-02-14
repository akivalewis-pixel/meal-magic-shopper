
import React, { useState, useCallback } from "react";
import { GroceryItem } from "@/types";

interface SimpleStoreDropdownProps {
  item: GroceryItem;
  availableStores: string[];
  onStoreChange: (item: GroceryItem) => void;
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
    
    // Call the consolidated update function
    onStoreChange(updatedItem);
    
    // Clear updating state quickly
    setTimeout(() => setIsUpdating(false), 300);
  }, [item, onStoreChange]);

  const currentStore = item.store || "Unassigned";

  return (
    <div className="relative">
      <select
        value={currentStore}
        onChange={handleChange}
        className={`w-32 h-8 text-xs bg-white border rounded px-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 ${
          isUpdating 
            ? 'border-green-500 bg-green-50 shadow-sm' 
            : 'border-gray-300 hover:border-gray-400'
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
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-sm"></div>
      )}
    </div>
  );
});

SimpleStoreDropdown.displayName = 'SimpleStoreDropdown';
