
export interface ShoppingListState {
  groceryItems: import("@/types").GroceryItem[];
  archivedItems: import("@/types").GroceryItem[];
  manualItems: import("@/types").GroceryItem[];
  availableStores: string[];
}

export interface ShoppingListActions {
  handleToggleGroceryItem: (id: string) => void;
  handleUpdateGroceryItem: (updatedItem: import("@/types").GroceryItem) => void;
  handleUpdateMultipleGroceryItems: (items: import("@/types").GroceryItem[], updates: Partial<import("@/types").GroceryItem>) => void;
  handleUpdateStores: (stores: string[]) => void;
  handleAddGroceryItem: (newItem: import("@/types").GroceryItem) => void;
  handleArchiveItem: (id: string) => void;
  resetShoppingList: () => void;
}
