
import React, { useState } from "react";
import { GroceryItem } from "@/types";
import { useSimpleShoppingList } from "@/hooks/useShoppingList/useSimpleShoppingList";
import { ShoppingListHeaderActions } from "./ShoppingListHeaderActions";
import { ShoppingListSearchAndFilters } from "./ShoppingListSearchAndFilters";
import { ShoppingListContent } from "./ShoppingListContent";
import { StoreManagementDialog } from "./StoreManagementDialog";
import { AddItemForm } from "./AddItemForm";

interface NewShoppingListProps {
  meals: any[];
  pantryItems?: string[];
}

export const NewShoppingList = ({ meals, pantryItems = [] }: NewShoppingListProps) => {
  const [viewMode, setViewMode] = useState<"list" | "board">("list");
  const [groupByStore, setGroupByStore] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStore, setSelectedStore] = useState<string>("all");
  const [isEditingStores, setIsEditingStores] = useState(false);
  const [isAddingItem, setIsAddingItem] = useState(false);
  
  const {
    groceryItems,
    archivedItems,
    availableStores,
    updateItem,
    toggleItem,
    archiveItem,
    addItem,
    updateStores,
    resetList
  } = useSimpleShoppingList(meals, pantryItems);

  // Filter items based on search and store selection
  const filteredItems = groceryItems.filter(item => {
    const matchesSearch = searchTerm === "" || 
      item.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStore = selectedStore === "all" || 
      (selectedStore === "Unassigned" ? (!item.store || item.store === "Unassigned") : item.store === selectedStore);
    
    return matchesSearch && matchesStore;
  });

  const handleAddNewItem = (newItem: GroceryItem) => {
    addItem(newItem);
    setIsAddingItem(false);
  };

  const handleSaveStores = (stores: string[]) => {
    updateStores(stores);
    setIsEditingStores(false);
  };

  // Handle item removal when checkbox is checked - use the proper toggle function
  const handleRemoveItem = (id: string) => {
    console.log("NewShoppingList: Toggling item with id:", id);
    toggleItem(id);
  };

  console.log("NewShoppingList - Selected store:", selectedStore);
  console.log("NewShoppingList - Filtered items:", filteredItems.length);
  console.log("NewShoppingList - Available stores:", availableStores);

  return (
    <section className="py-8 bg-gray-50">
      <div className="container mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Shopping List</h2>
          
          <ShoppingListHeaderActions
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            onManageStores={() => setIsEditingStores(true)}
            onAddItem={() => setIsAddingItem(true)}
            onReset={resetList}
          />
        </div>

        <ShoppingListSearchAndFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          selectedStore={selectedStore}
          onStoreChange={setSelectedStore}
          availableStores={availableStores}
          viewMode={viewMode}
          groupByStore={groupByStore}
          onGroupByStoreChange={setGroupByStore}
        />

        <div className="bg-white rounded-lg shadow p-4">
          <ShoppingListContent
            filteredItems={filteredItems}
            searchTerm={searchTerm}
            selectedStore={selectedStore}
            viewMode={viewMode}
            groupByStore={groupByStore}
            availableStores={availableStores}
            onUpdateItem={updateItem}
            onRemoveItem={handleRemoveItem}
          />
        </div>

        <StoreManagementDialog 
          open={isEditingStores} 
          onOpenChange={setIsEditingStores}
          stores={availableStores}
          onSaveStores={handleSaveStores}
        />
        
        <AddItemForm
          open={isAddingItem}
          onOpenChange={setIsAddingItem}
          availableStores={availableStores}
          onAddItem={handleAddNewItem}
          archivedItems={archivedItems}
          onSearchArchivedItems={() => {}}
          isSearchingArchived={false}
        />
      </div>
    </section>
  );
};
