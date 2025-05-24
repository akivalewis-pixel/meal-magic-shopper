
import React, { useState, useEffect } from "react";
import { GroceryItem } from "@/types";

interface SimpleStoreDropdownProps {
  item: GroceryItem;
  availableStores: string[];
  onStoreChange: (item: GroceryItem, store: string) => void;
}

export const SimpleStoreDropdown = ({
  item,
  availableStores,
  onStoreChange
}: SimpleStoreDropdownProps) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [localStore, setLocalStore] = useState(item.store || "Unassigned");

  // Update local state when item prop changes
  useEffect(() => {
    setLocalStore(item.store || "Unassigned");
    setIsUpdating(false);
  }, [item.store, item.__updateTimestamp]);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStore = e.target.value;
    console.log("SimpleStoreDropdown: Store change for:", item.name, "from:", item.store, "to:", newStore);
    
    // Optimistic update - change local state immediately
    setLocalStore(newStore);
    setIsUpdating(true);
    
    const updatedItem = { 
      ...item, 
      store: newStore,
      __updateTimestamp: Date.now()
    };
    
    // Call the parent callback
    onStoreChange(updatedItem, newStore);
    
    // Clear updating state after a short delay
    setTimeout(() => setIsUpdating(false), 500);
  };

  console.log("SimpleStoreDropdown: Rendering", item.name, "with store:", localStore, "updating:", isUpdating);

  return (
    <div className="relative">
      <select
        value={localStore}
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
};
