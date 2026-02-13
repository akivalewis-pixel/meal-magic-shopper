
import React from "react";
import { GroceryItem } from "@/types";
import { SimpleListView } from "./SimpleListView";
import { useCustomCategories } from "@/contexts/CustomCategoriesContext";

interface ShoppingListContentProps {
  filteredItems: GroceryItem[];
  searchTerm: string;
  selectedStore: string;
  viewMode: "list" | "board";
  groupByStore: boolean;
  availableStores: string[];
  onUpdateItem: (item: GroceryItem) => void;
  onRemoveItem: (id: string) => void;
  onDeleteItem: (id: string) => void;
}

export const ShoppingListContent = ({
  filteredItems,
  groupByStore,
  availableStores,
  onUpdateItem,
  onRemoveItem,
  onDeleteItem
}: ShoppingListContentProps) => {
  const { defaultCategoryOverrides, addDefaultCategoryOverride } = useCustomCategories();

  const handleCategoryNameChange = (oldName: string, newName: string) => {
    addDefaultCategoryOverride(oldName, newName);
  };

  return (
    <SimpleListView
      items={filteredItems}
      availableStores={availableStores}
      onUpdateItem={onUpdateItem}
      onToggleItem={onRemoveItem}
      onDeleteItem={onDeleteItem}
      groupByStore={groupByStore}
      customCategoryNames={defaultCategoryOverrides}
      onCategoryNameChange={handleCategoryNameChange}
    />
  );
};
