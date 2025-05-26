
import React from "react";
import { GroceryItem } from "@/types";
import { StoreManagementDialog } from "./StoreManagementDialog";
import { AddItemForm } from "./AddItemForm";

interface ShoppingListDialogsProps {
  isEditingStores: boolean;
  setIsEditingStores: (value: boolean) => void;
  isAddingItem: boolean;
  setIsAddingItem: (value: boolean) => void;
  availableStores: string[];
  onSaveStores: (stores: string[]) => void;
  onAddItem: (item: GroceryItem) => void;
  archivedItems: GroceryItem[];
}

export const ShoppingListDialogs = ({
  isEditingStores,
  setIsEditingStores,
  isAddingItem,
  setIsAddingItem,
  availableStores,
  onSaveStores,
  onAddItem,
  archivedItems
}: ShoppingListDialogsProps) => {
  return (
    <>
      <StoreManagementDialog 
        open={isEditingStores} 
        onOpenChange={setIsEditingStores}
        stores={availableStores}
        onSaveStores={onSaveStores}
      />
      
      <AddItemForm
        open={isAddingItem}
        onOpenChange={setIsAddingItem}
        availableStores={availableStores}
        onAddItem={onAddItem}
        archivedItems={archivedItems}
        onSearchArchivedItems={() => {}}
        isSearchingArchived={false}
      />
    </>
  );
};
