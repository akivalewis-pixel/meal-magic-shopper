
import React from "react";
import { GroceryItem } from "@/types";
import { GroupedShoppingList } from "./GroupedShoppingList";
import { StoreManagementDialog } from "./StoreManagementDialog";
import { AddItemForm } from "./AddItemForm";

interface ShoppingListContentProps {
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
  isEditingStores: boolean;
  setIsEditingStores: (value: boolean) => void;
  onSaveStores: (stores: string[]) => void;
  isAddingItem: boolean;
  setIsAddingItem: (value: boolean) => void;
  onAddItem?: (item: GroceryItem) => void;
  archivedItems: GroceryItem[];
  setSearchArchivedItems: (value: boolean) => void;
  searchTerm: string;
}

export const ShoppingListContent = ({
  groupedItems,
  onToggle,
  onQuantityChange,
  onStoreChange,
  onNameChange,
  onCategoryNameChange,
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
  searchTerm
}: ShoppingListContentProps) => {
  const handleAddNewItem = (item: GroceryItem) => {
    if (onAddItem) {
      onAddItem(item);
      // Close the add item dialog after adding
      setIsAddingItem(false);
      // Ensure we're not in archive view mode
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
