
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
    console.log(`SimpleStoreSelector: Changing ${item.name} from store: '${item.store}' to store: '${value}'`);
    
    // Don't normalize here - pass the raw value and let the update handler deal with it
    const updatedItem = {
      ...item,
      store: value,
      __updateTimestamp: Date.now()
    };
    
    onStoreChange(updatedItem, value);
  };

  // Determine current value for display
  const currentValue = item.store || "Unassigned";
  
  console.log(`SimpleStoreSelector: Rendering ${item.name} with store: '${item.store}' -> display value: '${currentValue}'`);

  return (
    <Select 
      value={currentValue} 
      onValueChange={handleStoreChange}
    >
      <SelectTrigger className="w-32 h-8 text-xs">
        <SelectValue placeholder="Select store" />
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
