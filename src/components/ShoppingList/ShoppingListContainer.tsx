
import React from "react";
import { useSimpleShoppingList } from "@/hooks/useShoppingList/useSimpleShoppingList";
import { useUndo } from "@/hooks/useUndo";
import { useShoppingListState } from "./ShoppingListState";
import { useShoppingListHandlers } from "./ShoppingListHandlers";
import { useShoppingListUndoHandlers } from "./ShoppingListUndoHandlers";
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
    resetList
  } = useSimpleShoppingList(meals, pantryItems);

  const { addAction, undo, redo, canUndo, canRedo } = useUndo();

  const handlers = useShoppingListHandlers({
    groceryItems,
    updateItem,
    toggleItem,
    addItem,
    updateStores,
    availableStores,
    addAction,
    setIsAddingItem: actions.setIsAddingItem,
    setIsEditingStores: actions.setIsEditingStores
  });

  const undoHandlers = useShoppingListUndoHandlers({
    updateItem,
    undo,
    redo
  });

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
      onUndo={undoHandlers.handleUndo}
      onRedo={undoHandlers.handleRedo}
      onUpdateItem={handlers.handleUpdateItem}
      onRemoveItem={handlers.handleRemoveItem}
      onSaveStores={handlers.handleSaveStores}
      onAddItem={handlers.handleAddNewItem}
      onReset={resetList}
    />
  );
};
