
import React, { useState } from "react";
import { GroceryItem } from "@/types";
import { ShoppingListHeader } from "./ShoppingListHeader";
import { ShoppingListFilters } from "./ShoppingListFilters";

interface ShoppingListActionsProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  showChecked: boolean;
  setShowChecked: (value: boolean) => void;
  selectedStore: string;
  setSelectedStore: (value: string) => void;
  groupByStore: boolean;
  setGroupByStore: (value: boolean) => void;
  sortBy: "store" | "department" | "category";
  setSortBy: (value: "store" | "department" | "category") => void;
  setIsEditingStores: (value: boolean) => void;
  availableStores: string[];
  setIsAddingItem: (value: boolean) => void;
  canAddItem: boolean;
  onResetList?: () => void;
  groceryItems?: GroceryItem[];
}

export const ShoppingListActions = ({
  searchTerm,
  setSearchTerm,
  sortBy,
  setSortBy,
  setIsEditingStores,
  setIsAddingItem,
  canAddItem,
  onResetList,
  groceryItems
}: ShoppingListActionsProps) => {
  return (
    <>
      <ShoppingListHeader 
        onEditStores={() => setIsEditingStores(true)} 
        onSortChange={setSortBy}
        sortBy={sortBy}
        onAddItem={() => setIsAddingItem(true)}
        canAddItem={canAddItem}
        onResetList={onResetList}
        groceryItems={groceryItems}
      />
      
      <div className="mb-6">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search ingredients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>
    </>
  );
};
