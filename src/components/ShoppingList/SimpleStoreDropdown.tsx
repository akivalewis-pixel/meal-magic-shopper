
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
    console.log("Store dropdown change:", item.name, "from:", item.store, "to:", newStore);
    onStoreChange(item, newStore);
  };

  const currentStore = item.store || "Unassigned";
  console.log("Rendering dropdown for:", item.name, "current store:", currentStore);

  return (
    <Select value={currentStore} onValueChange={handleChange}>
      <SelectTrigger className="w-32 h-8 text-xs bg-white">
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="bg-white border shadow-lg z-50">
        {availableStores.map(store => (
          <SelectItem key={store} value={store} className="bg-white hover:bg-gray-100">
            {store}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
