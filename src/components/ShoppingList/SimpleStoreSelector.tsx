
import React from "react";
import { GroceryItem } from "@/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SimpleStoreSelectorProps {
  item: GroceryItem;
  availableStores: string[];
  onStoreChange: (item: GroceryItem, store: string) => void;
}

export const SimpleStoreSelector = ({
  item,
  availableStores,
  onStoreChange
}: SimpleStoreSelectorProps) => {
  const handleStoreChange = (value: string) => {
    console.log(`SimpleStoreSelector: Changing ${item.name} from ${item.store} to ${value}`);
    const normalizedStore = value === "unassigned" ? "Unassigned" : value;
    onStoreChange(item, normalizedStore);
  };

  const currentValue = !item.store || item.store === "Unassigned" ? "unassigned" : item.store;

  return (
    <Select value={currentValue} onValueChange={handleStoreChange}>
      <SelectTrigger className="w-32 h-8 text-xs">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="unassigned">Unassigned</SelectItem>
        {availableStores
          .filter(store => store !== "Any Store" && store !== "Unassigned")
          .map(store => (
            <SelectItem key={store} value={store}>
              {store}
            </SelectItem>
          ))}
      </SelectContent>
    </Select>
  );
};
