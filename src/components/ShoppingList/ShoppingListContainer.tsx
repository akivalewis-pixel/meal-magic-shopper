
import React, { useState } from "react";
import { GroceryItem } from "@/types";
import { useSimpleShoppingList } from "@/hooks/useShoppingList/useSimpleShoppingList";
import { useUndo } from "@/hooks/useUndo";
import { ShoppingListHeaderActions } from "./ShoppingListHeaderActions";
import { ShoppingListSearchAndFilters } from "./ShoppingListSearchAndFilters";
import { ShoppingListContent } from "./ShoppingListContent";
import { ShoppingListUndoActions } from "./ShoppingListUndoActions";
import { ShoppingListDialogs } from "./ShoppingListDialogs";

interface ShoppingListContainerProps {
  meals: any[];
  pantryItems?: string[];
}

export const ShoppingListContainer = ({ meals, pantryItems = [] }: ShoppingListContainerProps) => {
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

  const { addAction, undo, redo, canUndo, canRedo } = useUndo();

  // Filter items based on search and store selection
  const filteredItems = groceryItems.filter(item => {
    const matchesSearch = searchTerm === "" || 
      item.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStore = selectedStore === "all" || 
      (selectedStore === "Unassigned" ? (!item.store || item.store === "Unassigned") : item.store === selectedStore);
    
    return matchesSearch && matchesStore;
  });

  const handleAddNewItem = (newItem: GroceryItem) => {
    addAction({
      id: `add-${Date.now()}`,
      type: 'add',
      data: { item: newItem }
    });
    addItem(newItem);
    setIsAddingItem(false);
  };

  const handleSaveStores = (stores: string[]) => {
    addAction({
      id: `stores-${Date.now()}`,
      type: 'update',
      data: { stores: availableStores, newStores: stores }
    });
    updateStores(stores);
    setIsEditingStores(false);
  };

  // Handle item removal when checkbox is checked - use the proper toggle function
  const handleRemoveItem = (id: string) => {
    console.log("ShoppingListContainer: Toggling item with id:", id);
    const item = groceryItems.find(i => i.id === id);
    if (item) {
      addAction({
        id: `toggle-${Date.now()}`,
        type: 'toggle',
        data: { item: { ...item } }
      });
      toggleItem(id);
    }
  };

  const handleUpdateItem = (updatedItem: GroceryItem) => {
    const originalItem = groceryItems.find(i => i.id === updatedItem.id);
    if (originalItem) {
      addAction({
        id: `update-${Date.now()}`,
        type: 'update',
        data: { original: { ...originalItem }, updated: { ...updatedItem } }
      });
    }
    updateItem(updatedItem);
  };

  const handleUndo = () => {
    const lastAction = undo();
    if (!lastAction) return;

    console.log("Performing undo for action:", lastAction);

    switch (lastAction.type) {
      case 'toggle':
        // Re-add the item by toggling it back
        if (lastAction.data.item) {
          console.log("Undoing toggle for item:", lastAction.data.item.name);
          // The item should reappear as active
        }
        break;
      case 'add':
        // Remove the added item
        console.log("Undoing add for item:", lastAction.data.item?.name);
        break;
      case 'update':
        // Restore original item state
        if (lastAction.data.original) {
          updateItem(lastAction.data.original);
        }
        break;
    }
  };

  const handleRedo = () => {
    const redoAction = redo();
    if (!redoAction) return;

    console.log("Performing redo for action:", redoAction);
    // Implement redo logic based on action type
  };

  console.log("ShoppingListContainer - Selected store:", selectedStore);
  console.log("ShoppingListContainer - Filtered items:", filteredItems.length);
  console.log("ShoppingListContainer - Available stores:", availableStores);

  return (
    <section className="py-8 bg-gray-50">
      <div className="container mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Shopping List</h2>
          
          <div className="flex items-center gap-2">
            <ShoppingListUndoActions
              canUndo={canUndo}
              canRedo={canRedo}
              onUndo={handleUndo}
              onRedo={handleRedo}
            />

            <ShoppingListHeaderActions
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              onManageStores={() => setIsEditingStores(true)}
              onAddItem={() => setIsAddingItem(true)}
              onReset={resetList}
            />
          </div>
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
            onUpdateItem={handleUpdateItem}
            onRemoveItem={handleRemoveItem}
          />
        </div>

        <ShoppingListDialogs
          isEditingStores={isEditingStores}
          setIsEditingStores={setIsEditingStores}
          isAddingItem={isAddingItem}
          setIsAddingItem={setIsAddingItem}
          availableStores={availableStores}
          onSaveStores={handleSaveStores}
          onAddItem={handleAddNewItem}
          archivedItems={archivedItems}
        />
      </div>
    </section>
  );
};
