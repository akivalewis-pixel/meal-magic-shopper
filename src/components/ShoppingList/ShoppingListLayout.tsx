
import React from "react";
import { GroceryItem } from "@/types";
import { ShoppingListHeaderActions } from "./ShoppingListHeaderActions";
import { ShoppingListSearchAndFilters } from "./ShoppingListSearchAndFilters";
import { ShoppingListContent } from "./ShoppingListContent";
import { ShoppingListUndoActions } from "./ShoppingListUndoActions";
import { ShoppingListDialogs } from "./ShoppingListDialogs";
import { ShoppingListViewState } from "./ShoppingListState";
import { useIsMobile } from "@/hooks/use-mobile";

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
  onDeleteItem: (id: string) => void;
  onSaveStores: (stores: string[]) => void;
  onAddItem: (item: GroceryItem) => void;
  onAddItems?: (items: Omit<GroceryItem, 'id' | 'checked'>[]) => void;
  onReset: () => void;
  getCurrentItems: () => GroceryItem[];
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
  onDeleteItem,
  onSaveStores,
  onAddItem,
  onAddItems,
  onReset,
  getCurrentItems
}: ShoppingListLayoutProps) => {
  const isMobile = useIsMobile();
  
  return (
    <section className="py-4 sm:py-8 bg-gray-50">
      <div className="container mx-auto px-2 sm:px-4">
        <div className={`flex ${isMobile ? 'flex-col gap-3' : 'items-center justify-between'} mb-4`}>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Shopping List</h2>
          
          <div className="flex flex-wrap items-center gap-2">
            <ShoppingListUndoActions
              canUndo={canUndo}
              canRedo={canRedo}
              onUndo={onUndo}
              onRedo={onRedo}
            />

            <ShoppingListHeaderActions
              viewMode="list"
              onViewModeChange={actions.setViewMode}
              onManageStores={() => actions.setIsEditingStores(true)}
              onAddItem={() => actions.setIsAddingItem(true)}
              onReset={onReset}
              onAddItems={onAddItems}
              groceryItems={getCurrentItems()}
            />
          </div>
        </div>

        <ShoppingListSearchAndFilters
          searchTerm={state.searchTerm}
          onSearchChange={actions.setSearchTerm}
          selectedStore={state.selectedStore}
          onStoreChange={actions.setSelectedStore}
          availableStores={availableStores}
          viewMode="list"
          groupByStore={state.groupByStore}
          onGroupByStoreChange={actions.setGroupByStore}
        />

        <div className="bg-white rounded-lg shadow p-2 sm:p-4">
          <ShoppingListContent
            filteredItems={filteredItems}
            searchTerm={state.searchTerm}
            selectedStore={state.selectedStore}
            viewMode="list"
            groupByStore={state.groupByStore}
            availableStores={availableStores}
            onUpdateItem={onUpdateItem}
            onRemoveItem={onRemoveItem}
            onDeleteItem={onDeleteItem}
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
          getCurrentItems={getCurrentItems}
        />
      </div>
    </section>
  );
};
