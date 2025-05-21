
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
}

export const ShoppingListActions = ({
  searchTerm,
  setSearchTerm,
  showChecked,
  setShowChecked,
  selectedStore,
  setSelectedStore,
  groupByStore,
  setGroupByStore,
  sortBy,
  setSortBy,
  setIsEditingStores,
  availableStores,
  setIsAddingItem,
  canAddItem
}: ShoppingListActionsProps) => {
  return (
    <>
      <ShoppingListHeader 
        onEditStores={() => setIsEditingStores(true)} 
        onSortChange={setSortBy}
        sortBy={sortBy}
        onAddItem={() => setIsAddingItem(true)}
        canAddItem={canAddItem}
      />
      
      <ShoppingListFilters 
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedStore={selectedStore}
        onStoreFilterChange={setSelectedStore}
        showChecked={showChecked}
        onToggleShowChecked={() => setShowChecked(!showChecked)}
        groupByStore={groupByStore}
        onToggleGroupByStore={() => setGroupByStore(!groupByStore)}
        availableStores={availableStores}
      />
    </>
  );
};
