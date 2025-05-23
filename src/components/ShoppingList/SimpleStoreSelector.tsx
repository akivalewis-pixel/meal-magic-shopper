
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
    console.log(`SimpleStoreSelector: Changing ${item.name} to store: ${value}`);
    onStoreChange(item, value);
  };

  // Determine current value - treat empty/undefined as "Unassigned"
  const currentValue = item.store && item.store !== "Unassigned" ? item.store : "Unassigned";
  
  console.log(`SimpleStoreSelector: Rendering ${item.name} with current store: '${item.store}' -> display value: '${currentValue}'`);

  return (
    <Select value={currentValue} onValueChange={handleStoreChange}>
      <SelectTrigger className="w-32 h-8 text-xs">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="Unassigned">Unassigned</SelectItem>
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
