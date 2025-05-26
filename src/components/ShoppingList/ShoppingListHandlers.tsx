
import { GroceryItem } from "@/types";

interface ShoppingListHandlersProps {
  groceryItems: GroceryItem[];
  updateItem: (item: GroceryItem) => void;
  toggleItem: (id: string) => void;
  addItem: (item: GroceryItem) => void;
  updateStores: (stores: string[]) => void;
  availableStores: string[];
  addAction: (action: any) => void;
  setIsAddingItem: (value: boolean) => void;
  setIsEditingStores: (value: boolean) => void;
}

export function useShoppingListHandlers({
  groceryItems,
  updateItem,
  toggleItem,
  addItem,
  updateStores,
  availableStores,
  addAction,
  setIsAddingItem,
  setIsEditingStores
}: ShoppingListHandlersProps) {
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

  return {
    handleAddNewItem,
    handleSaveStores,
    handleRemoveItem,
    handleUpdateItem
  };
}
