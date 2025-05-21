
import React from "react";
import { GroceryItem } from "@/types";
import { ShoppingListGroup } from "./ShoppingListGroup";

interface GroupedShoppingListProps {
  groupedItems: Record<string, Record<string, GroceryItem[]>>;
  onToggle: (id: string) => void;
  onQuantityChange: (item: GroceryItem, quantity: string) => void;
  onStoreChange: (item: GroceryItem, store: string) => void;
  onNameChange: (item: GroceryItem, name: string) => void;
  onCategoryNameChange: (oldName: string, newName: string) => void;
  availableStores: string[];
  groupByStore: boolean;
  searchArchivedItems: boolean;
  customCategoryNames: Record<string, string>;
}

export const GroupedShoppingList = ({
  groupedItems,
  onToggle,
  onQuantityChange,
  onStoreChange,
  onNameChange,
  onCategoryNameChange,
  availableStores,
  groupByStore,
  searchArchivedItems,
  customCategoryNames
}: GroupedShoppingListProps) => {
  // Function to get the display category name (custom or default)
  const getDisplayCategoryName = (categoryName: string): string => {
    return customCategoryNames[categoryName] || categoryName;
  };

  if (Object.keys(groupedItems).length === 0) {
    return (
      <div className="text-center py-10 text-gray-500">
        <p>No items in your {searchArchivedItems ? "archive" : "shopping list"}</p>
      </div>
    );
  }

  return (
    <>
      {Object.entries(groupedItems).map(([storeName, categories]) => (
        <div key={storeName} className="mb-8 last:mb-0">
          {groupByStore && (
            <h3 className="text-lg font-semibold mb-4 pb-1 border-b">{storeName}</h3>
          )}
          
          {Object.entries(categories).map(([categoryName, items]) => (
            <ShoppingListGroup 
              key={`${storeName}-${categoryName}`}
              categoryName={getDisplayCategoryName(categoryName)}
              items={items}
              onToggle={onToggle}
              onQuantityChange={onQuantityChange}
              onStoreChange={onStoreChange}
              onNameChange={onNameChange}
              onCategoryNameChange={onCategoryNameChange}
              availableStores={availableStores}
              isArchiveView={searchArchivedItems}
            />
          ))}
        </div>
      ))}
    </>
  );
};
