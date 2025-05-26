
import React from "react";
import { GroceryItem } from "@/types";
import { SimpleListView } from "./SimpleListView";
import { ShoppingListBoard } from "./ShoppingListBoard";
import { useShoppingListGrouping } from "./useShoppingListGrouping";
import { useCategoryNames } from "./useCategoryNames";

interface ShoppingListContentProps {
  filteredItems: GroceryItem[];
  searchTerm: string;
  selectedStore: string;
  viewMode: "list" | "board";
  groupByStore: boolean;
  availableStores: string[];
  onUpdateItem: (item: GroceryItem) => void;
  onRemoveItem: (id: string) => void;
}

export const ShoppingListContent = ({
  filteredItems,
  searchTerm,
  selectedStore,
  viewMode,
  groupByStore,
  availableStores,
  onUpdateItem,
  onRemoveItem
}: ShoppingListContentProps) => {
  const { customCategoryNames, handleCategoryNameChange } = useCategoryNames();
  const { groupedItems } = useShoppingListGrouping({
    items: filteredItems,
    groupByStore,
    searchTerm,
    selectedStore,
    customCategoryNames
  });

  const handleUpdateMultipleItems = (items: GroceryItem[], updates: Partial<GroceryItem>) => {
    items.forEach(item => {
      onUpdateItem({ ...item, ...updates });
    });
  };

  if (viewMode === "board") {
    return (
      <ShoppingListBoard
        groupedItems={groupedItems}
        onUpdateItem={onUpdateItem}
        onUpdateMultiple={handleUpdateMultipleItems}
        availableStores={availableStores}
        customCategoryNames={customCategoryNames}
      />
    );
  }

  return (
    <SimpleListView
      items={filteredItems}
      availableStores={availableStores}
      onUpdateItem={onUpdateItem}
      onToggleItem={onRemoveItem}
      groupByStore={groupByStore}
      customCategoryNames={customCategoryNames}
      onCategoryNameChange={handleCategoryNameChange}
    />
  );
};
