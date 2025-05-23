
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
    console.log("SimpleStoreDropdown: Store dropdown change:", item.name, "from:", item.store, "to:", newStore);
    
    // Create updated item with new store
    const updatedItem = { 
      ...item, 
      store: newStore,
      __updateTimestamp: Date.now()
    };
    
    console.log("SimpleStoreDropdown: Calling onStoreChange with updated item:", updatedItem);
    onStoreChange(updatedItem, newStore);
  };

  const currentStore = item.store || "Unassigned";
  console.log("SimpleStoreDropdown: Rendering dropdown for:", item.name, "current store:", currentStore);

  return (
    <Select 
      value={currentStore} 
      onValueChange={handleChange}
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
