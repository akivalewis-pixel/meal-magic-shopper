
import React from "react";
import { GroceryItem } from "@/types";
import { ShoppingListHeaderActions } from "./ShoppingListHeaderActions";
import { ShoppingListSearchAndFilters } from "./ShoppingListSearchAndFilters";
import { ShoppingListContent } from "./ShoppingListContent";
import { ShoppingListUndoActions } from "./ShoppingListUndoActions";
import { ShoppingListDialogs } from "./ShoppingListDialogs";
import { ShoppingListViewState } from "./ShoppingListState";

interface ShoppingListLayoutProps {
  state: ShoppingListViewState;
  actions: {
    setViewMode: (mode: "list" | "board") => void;
    setGroupByStore: (value: boolean) => void;
    setSearchTerm: (value: string) => void;
    setSelectedStore: (value: string) => void;
    setIsEditingStores: (value: boolean) => void;
    setIsAddingItem: (value: boolean) => void;
  };
  filteredItems: GroceryItem[];
  availableStores: string[];
  archivedItems: GroceryItem[];
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onUpdateItem: (item: GroceryItem) => void;
  onRemoveItem: (id: string) => void;
  onSaveStores: (stores: string[]) => void;
  onAddItem: (item: GroceryItem) => void;
  onReset: () => void;
}

export const ShoppingListLayout = ({
  state,
  actions,
  filteredItems,
  availableStores,
  archivedItems,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onUpdateItem,
  onRemoveItem,
  onSaveStores,
  onAddItem,
  onReset
}: ShoppingListLayoutProps) => {
  console.log("ShoppingListLayout - Selected store:", state.selectedStore);
  console.log("ShoppingListLayout - Filtered items:", filteredItems.length);
  console.log("ShoppingListLayout - Available stores:", availableStores);

  return (
    <section className="py-8 bg-gray-50">
      <div className="container mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Shopping List</h2>
          
          <div className="flex items-center gap-2">
            <ShoppingListUndoActions
              canUndo={canUndo}
              canRedo={canRedo}
              onUndo={onUndo}
              onRedo={onRedo}
            />

            <ShoppingListHeaderActions
              viewMode={state.viewMode}
              onViewModeChange={actions.setViewMode}
              onManageStores={() => actions.setIsEditingStores(true)}
              onAddItem={() => actions.setIsAddingItem(true)}
              onReset={onReset}
            />
          </div>
        </div>

        <ShoppingListSearchAndFilters
          searchTerm={state.searchTerm}
          onSearchChange={actions.setSearchTerm}
          selectedStore={state.selectedStore}
          onStoreChange={actions.setSelectedStore}
          availableStores={availableStores}
          viewMode={state.viewMode}
          groupByStore={state.groupByStore}
          onGroupByStoreChange={actions.setGroupByStore}
        />

        <div className="bg-white rounded-lg shadow p-4">
          <ShoppingListContent
            filteredItems={filteredItems}
            searchTerm={state.searchTerm}
            selectedStore={state.selectedStore}
            viewMode={state.viewMode}
            groupByStore={state.groupByStore}
            availableStores={availableStores}
            onUpdateItem={onUpdateItem}
            onRemoveItem={onRemoveItem}
          />
        </div>

        <ShoppingListDialogs
          isEditingStores={state.isEditingStores}
          setIsEditingStores={actions.setIsEditingStores}
          isAddingItem={state.isAddingItem}
          setIsAddingItem={actions.setIsAddingItem}
          availableStores={availableStores}
          onSaveStores={onSaveStores}
          onAddItem={onAddItem}
          archivedItems={archivedItems}
        />
      </div>
    </section>
  );
};
