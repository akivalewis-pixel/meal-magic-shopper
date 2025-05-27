
import React from "react";
import { useSimplifiedShoppingList } from "@/hooks/useShoppingList/useSimplifiedShoppingList";
import { useUndo } from "@/hooks/useUndo";
import { useShoppingListState } from "./ShoppingListState";
import { ShoppingListLayout } from "./ShoppingListLayout";

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
  const handleUpdateItem = (updatedItem: any) => {
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

  const handleAddItem = (newItem: any) => {
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
    // Implementation would depend on the specific action type
    undo();
  };

  const handleRedo = () => {
    // Implementation would depend on the specific action type
    redo();
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
