
import React from "react";
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
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStore = e.target.value;
    console.log("SimpleStoreDropdown: Store change for:", item.name, "from:", item.store, "to:", newStore);
    
    const updatedItem = { 
      ...item, 
      store: newStore,
      __updateTimestamp: Date.now()
    };
    
    onStoreChange(updatedItem, newStore);
  };

  const currentStore = item.store || "Unassigned";
  
  console.log("SimpleStoreDropdown: Rendering", item.name, "with store:", currentStore, "timestamp:", item.__updateTimestamp);

  return (
    <select
      value={currentStore}
      onChange={handleChange}
      className="w-32 h-8 text-xs bg-white border border-gray-300 rounded px-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
  );
};
