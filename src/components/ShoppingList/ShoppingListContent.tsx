
import React from "react";
import { GroceryItem } from "@/types";
import { SimpleListView } from "./SimpleListView";
import { SimpleBoardView } from "./SimpleBoardView";

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
  if (filteredItems.length === 0) {
    return (
      <div className="text-center py-10 text-gray-500">
        <p>
          {searchTerm || selectedStore !== "all" 
            ? "No items match your filters"
            : "No items in your shopping list"
          }
        </p>
        {(searchTerm || selectedStore !== "all") && (
          <p className="text-sm mt-2">Try adjusting your search or store filter</p>
        )}
      </div>
    );
  }

  return viewMode === "board" ? (
    <SimpleBoardView
      items={filteredItems}
      availableStores={availableStores}
      onUpdateItem={onUpdateItem}
    />
  ) : (
    <SimpleListView
      items={filteredItems}
      availableStores={availableStores}
      onUpdateItem={onUpdateItem}
      onToggleItem={onRemoveItem}
      groupByStore={groupByStore}
    />
  );
};
