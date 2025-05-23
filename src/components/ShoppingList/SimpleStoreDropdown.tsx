
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
    console.log("Store dropdown change:", item.name, "->", newStore);
    onStoreChange({ ...item, store: newStore }, newStore);
  };

  const currentStore = item.store || "Unassigned";

  return (
    <Select value={currentStore} onValueChange={handleChange}>
      <SelectTrigger className="w-32 h-8 text-xs">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {availableStores.map(store => (
          <SelectItem key={store} value={store}>
            {store}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
