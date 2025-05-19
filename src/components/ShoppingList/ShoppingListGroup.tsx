
import React from "react";
import { GroceryItem } from "@/types";
import { ShoppingListItem } from "./ShoppingListItem";

interface ShoppingListGroupProps {
  categoryName: string;
  items: GroceryItem[];
  onToggle: (id: string) => void;
  onQuantityChange: (item: GroceryItem, quantity: string) => void;
  onStoreChange: (item: GroceryItem, store: string) => void;
  onToggleRecurring: (item: GroceryItem) => void;
  onNameChange?: (item: GroceryItem, name: string) => void;
  availableStores: string[];
}

export const ShoppingListGroup = ({
  categoryName,
  items,
  onToggle,
  onQuantityChange,
  onStoreChange,
  onToggleRecurring,
  onNameChange,
  availableStores
}: ShoppingListGroupProps) => {
  return (
    <div className="mb-6 last:mb-0">
      <h4 className="font-medium mb-2">{categoryName}</h4>
      <ul className="space-y-3">
        {items.map((item) => (
          <ShoppingListItem
            key={item.id}
            item={item}
            onToggle={onToggle}
            onQuantityChange={onQuantityChange}
            onStoreChange={onStoreChange}
            onToggleRecurring={onToggleRecurring}
            onNameChange={onNameChange}
            availableStores={availableStores}
          />
        ))}
      </ul>
    </div>
  );
};
