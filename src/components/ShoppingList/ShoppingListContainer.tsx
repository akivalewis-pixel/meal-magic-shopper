
import React, { useEffect } from "react";
import { useUndo } from "@/hooks/useUndo";
import { useShoppingListState } from "./ShoppingListState";
import { ShoppingListLayout } from "./ShoppingListLayout";
import { GroceryItem } from "@/types";
import { shoppingListStateRef } from "@/hooks/useShoppingList";

interface ShoppingListContainerProps {
  meals: any[];
  pantryItems?: string[];
  groceryItems: GroceryItem[];
  archivedItems: GroceryItem[];
  availableStores: string[];
  updateItem: (item: GroceryItem) => void;
  toggleItem: (id: string) => void;
  archiveItem: (id: string) => void;
  addItem: (item: Omit<GroceryItem, 'id' | 'checked'>) => void;
  updateStores: (stores: string[]) => void;
  resetList: () => void;
  getCurrentItems: () => GroceryItem[];
}

export const ShoppingListContainer = ({ 
  groceryItems,
  archivedItems,
  availableStores,
  updateItem,
  toggleItem,
  addItem,
  updateStores,
  resetList,
  getCurrentItems
}: ShoppingListContainerProps) => {
  const { state, actions } = useShoppingListState();

  // Ensure global state is updated whenever items change
  useEffect(() => {
    console.log("ShoppingListContainer: Updating global state with", groceryItems.length, "items");
    shoppingListStateRef.currentItems = [...groceryItems];
    shoppingListStateRef.availableStores = [...availableStores];
  }, [groceryItems, availableStores]);

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

  const handleAddItems = (newItems: Omit<GroceryItem, 'id' | 'checked'>[]) => {
    newItems.forEach(item => {
      addAction({
        id: `add-${Date.now()}-${Math.random()}`,
        type: 'add',
        data: { item: { ...item, id: '', checked: false } as GroceryItem }
      });
      addItem(item);
    });
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

    switch (lastAction.type) {
      case 'toggle':
        if (lastAction.data.item) {
          addItem({ ...lastAction.data.item, checked: false });
        }
        break;
      case 'add':
        if (lastAction.data.item) {
          toggleItem(lastAction.data.item.id);
        }
        break;
      case 'update':
        if (lastAction.data.original) {
          updateItem(lastAction.data.original);
        }
        break;
    }
  };

  const handleRedo = () => {
    const redoAction = redo();
    if (!redoAction) return;

    switch (redoAction.type) {
      case 'toggle':
        if (redoAction.data.item) {
          toggleItem(redoAction.data.item.id);
        }
        break;
      case 'add':
        if (redoAction.data.item) {
          addItem(redoAction.data.item);
        }
        break;
      case 'update':
        if (redoAction.data.updated) {
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
      onAddItems={handleAddItems}
      onReset={resetList}
      getCurrentItems={getCurrentItems}
    />
  );
};
