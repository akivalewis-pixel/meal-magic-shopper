
import React from "react";
import { GroceryItem } from "@/types";
import { GroupedShoppingList } from "./GroupedShoppingList";
import { ShoppingListBoard } from "./ShoppingListBoard";
import { StoreManagementDialog } from "./StoreManagementDialog";
import { AddItemForm } from "./AddItemForm";

interface ShoppingListContentProps {
  groupedItems: Record<string, Record<string, GroceryItem[]>>;
  onToggle: (id: string) => void;
  onQuantityChange: (item: GroceryItem, quantity: string) => void;
  onStoreChange: (item: GroceryItem, store: string) => void;
  onNameChange: (item: GroceryItem, name: string) => void;
  onCategoryNameChange: (oldName: string, newName: string) => void;
  onUpdateItem: (updatedItem: GroceryItem) => void;
  onUpdateMultiple: (items: GroceryItem[], updates: Partial<GroceryItem>) => void;
  availableStores: string[];
  groupByStore: boolean;
  searchArchivedItems: boolean;
  customCategoryNames: Record<string, string>;
  isEditingStores: boolean;
  setIsEditingStores: (value: boolean) => void;
  onSaveStores: (stores: string[]) => void;
  isAddingItem: boolean;
  setIsAddingItem: (value: boolean) => void;
  onAddItem?: (item: GroceryItem) => void;
  archivedItems: GroceryItem[];
  setSearchArchivedItems: (value: boolean) => void;
  searchTerm: string;
  viewMode: "list" | "board";
}

export const ShoppingListContent = ({
  groupedItems,
  onToggle,
  onQuantityChange,
  onStoreChange,
  onNameChange,
  onCategoryNameChange,
  onUpdateItem,
  onUpdateMultiple,
  availableStores,
  groupByStore,
  searchArchivedItems,
  customCategoryNames,
  isEditingStores,
  setIsEditingStores,
  onSaveStores,
  isAddingItem,
  setIsAddingItem,
  onAddItem,
  archivedItems,
  setSearchArchivedItems,
  searchTerm,
  viewMode
}: ShoppingListContentProps) => {
  const handleAddNewItem = (item: GroceryItem) => {
    if (onAddItem) {
      onAddItem(item);
      setIsAddingItem(false);
      setSearchArchivedItems(false);
    }
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow p-4">
        {searchTerm && Object.keys(groupedItems).length === 0 && (
          <div className="text-center py-10 text-gray-500">
            <p className="text-sm mt-2">Try a different search term</p>
          </div>
        )}
        
        {viewMode === "board" ? (
          <ShoppingListBoard
            groupedItems={groupedItems}
            onUpdateItem={onUpdateItem}
            onUpdateMultiple={onUpdateMultiple}
            availableStores={availableStores}
            customCategoryNames={customCategoryNames}
          />
        ) : (
          <GroupedShoppingList
            groupedItems={groupedItems}
            onToggle={onToggle}
            onQuantityChange={onQuantityChange}
            onStoreChange={onStoreChange}
            onNameChange={onNameChange}
            onCategoryNameChange={onCategoryNameChange}
            availableStores={availableStores}
            groupByStore={groupByStore}
            searchArchivedItems={searchArchivedItems}
            customCategoryNames={customCategoryNames}
          />
        )}
      </div>

      <StoreManagementDialog 
        open={isEditingStores} 
        onOpenChange={setIsEditingStores}
        stores={availableStores}
        onSaveStores={onSaveStores}
      />
      
      {onAddItem && (
        <AddItemForm
          open={isAddingItem}
          onOpenChange={setIsAddingItem}
          availableStores={availableStores}
          onAddItem={handleAddNewItem}
          archivedItems={archivedItems}
          onSearchArchivedItems={setSearchArchivedItems}
          isSearchingArchived={searchArchivedItems}
        />
      )}
    </>
  );
};
