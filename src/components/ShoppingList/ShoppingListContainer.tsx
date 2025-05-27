
import React from "react";
import { useSimplifiedShoppingList } from "@/hooks/useShoppingList/useSimplifiedShoppingList";
import { useUndo } from "@/hooks/useUndo";
import { useShoppingListState } from "./ShoppingListState";
import { ShoppingListLayout } from "./ShoppingListLayout";
import { GroceryItem } from "@/types";

interface ShoppingListContainerProps {
  meals: any[];
  pantryItems?: string[];
}

export const ShoppingListContainer = ({ meals, pantryItems = [] }: ShoppingListContainerProps) => {
  const { state, actions } = useShoppingListState();
  
  const {
    groceryItems,
    archivedItems,
    availableStores,
    updateItem,
    toggleItem,
    archiveItem,
    addItem,
    updateStores,
    resetList,
    getCurrentItems
  } = useSimplifiedShoppingList(meals, pantryItems);

  const { addAction, undo, redo, canUndo, canRedo } = useUndo();

  // Handlers with undo support
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

  const handleRemoveItem = (id: string) => {
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

  const handleAddItem = (newItem: GroceryItem) => {
    addAction({
      id: `add-${Date.now()}`,
      type: 'add',
      data: { item: newItem }
    });
    addItem(newItem);
    actions.setIsAddingItem(false);
  };

  const handleSaveStores = (stores: string[]) => {
    addAction({
      id: `stores-${Date.now()}`,
      type: 'update',
      data: { stores: availableStores, newStores: stores }
    });
    updateStores(stores);
    actions.setIsEditingStores(false);
  };

  const handleUndo = () => {
    const lastAction = undo();
    if (!lastAction) return;

    console.log("Performing undo for action:", lastAction);

    switch (lastAction.type) {
      case 'toggle':
        // Restore the item back to the main list
        if (lastAction.data.item) {
          console.log("Undoing toggle for item:", lastAction.data.item.name);
          // Add the item back with unchecked status
          addItem({ ...lastAction.data.item, checked: false });
        }
        break;
      case 'add':
        // Remove the item that was added
        if (lastAction.data.item) {
          console.log("Undoing add for item:", lastAction.data.item.name);
          toggleItem(lastAction.data.item.id);
        }
        break;
      case 'update':
        // Restore the original item state
        if (lastAction.data.original) {
          console.log("Undoing update for item:", lastAction.data.original.name);
          updateItem(lastAction.data.original);
        }
        break;
    }
  };

  const handleRedo = () => {
    const redoAction = redo();
    if (!redoAction) return;

    console.log("Performing redo for action:", redoAction);

    switch (redoAction.type) {
      case 'toggle':
        // Re-toggle the item
        if (redoAction.data.item) {
          console.log("Redoing toggle for item:", redoAction.data.item.name);
          toggleItem(redoAction.data.item.id);
        }
        break;
      case 'add':
        // Re-add the item
        if (redoAction.data.item) {
          console.log("Redoing add for item:", redoAction.data.item.name);
          addItem(redoAction.data.item);
        }
        break;
      case 'update':
        // Re-apply the update
        if (redoAction.data.updated) {
          console.log("Redoing update for item:", redoAction.data.updated.name);
          updateItem(redoAction.data.updated);
        }
        break;
    }
  };

  // Filter items based on search and store selection
  const filteredItems = groceryItems.filter(item => {
    const matchesSearch = state.searchTerm === "" || 
      item.name.toLowerCase().includes(state.searchTerm.toLowerCase());
    
    const matchesStore = state.selectedStore === "all" || 
      (state.selectedStore === "Unassigned" ? (!item.store || item.store === "Unassigned") : item.store === state.selectedStore);
    
    return matchesSearch && matchesStore;
  });

  return (
    <ShoppingListLayout
      state={state}
      actions={actions}
      filteredItems={filteredItems}
      availableStores={availableStores}
      archivedItems={archivedItems}
      canUndo={canUndo}
      canRedo={canRedo}
      onUndo={handleUndo}
      onRedo={handleRedo}
      onUpdateItem={handleUpdateItem}
      onRemoveItem={handleRemoveItem}
      onSaveStores={handleSaveStores}
      onAddItem={handleAddItem}
      onReset={resetList}
      getCurrentItems={getCurrentItems}
    />
  );
};
