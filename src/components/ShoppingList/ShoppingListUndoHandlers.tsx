
import { GroceryItem } from "@/types";

interface ShoppingListUndoHandlersProps {
  updateItem: (item: GroceryItem) => void;
  undo: () => any;
  redo: () => any;
}

export function useShoppingListUndoHandlers({
  updateItem,
  undo,
  redo
}: ShoppingListUndoHandlersProps) {
  const handleUndo = () => {
    const lastAction = undo();
    if (!lastAction) return;

    console.log("Performing undo for action:", lastAction);

    switch (lastAction.type) {
      case 'toggle':
        if (lastAction.data.item) {
          console.log("Undoing toggle for item:", lastAction.data.item.name);
        }
        break;
      case 'add':
        console.log("Undoing add for item:", lastAction.data.item?.name);
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

    console.log("Performing redo for action:", redoAction);
  };

  return {
    handleUndo,
    handleRedo
  };
}
