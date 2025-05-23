
import React from "react";
import { GroceryItem } from "@/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  const handleChange = (newStore: string) => {
    console.log("SimpleStoreDropdown: Store change for:", item.name, "from:", item.store, "to:", newStore);
    
    const updatedItem = { 
      ...item, 
      store: newStore,
      __updateTimestamp: Date.now() // Force re-render
    };
    
    onStoreChange(updatedItem, newStore);
  };

  const currentStore = item.store || "Unassigned";
  
  console.log("SimpleStoreDropdown: Rendering", item.name, "with store:", currentStore, "timestamp:", item.__updateTimestamp);

  return (
    <Select 
      value={currentStore} 
      onValueChange={handleChange}
      key={`${item.id}-${item.__updateTimestamp || 0}`} // Force re-render on updates
    >
      <SelectTrigger className="w-32 h-8 text-xs bg-white border border-gray-300">
        <SelectValue placeholder="Select store" />
      </SelectTrigger>
      <SelectContent className="bg-white border shadow-lg z-[100]">
        <SelectItem 
          value="Unassigned" 
          className="bg-white hover:bg-gray-100 cursor-pointer"
        >
          Unassigned
        </SelectItem>
        {availableStores
          .filter(store => store !== "Unassigned")
          .map(store => (
            <SelectItem 
              key={store} 
              value={store} 
              className="bg-white hover:bg-gray-100 cursor-pointer"
            >
              {store}
            </SelectItem>
          ))}
      </SelectContent>
    </Select>
  );
};
