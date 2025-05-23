
import { GroceryItem } from "@/types";
import { useItemActions } from "./useItemActions";
import { useUpdateActions } from "./useUpdateActions";
import { useStoreActions } from "./useStoreActions";

interface UseShoppingListActionsProps {
  groceryItems: GroceryItem[];
  setGroceryItems: (items: GroceryItem[] | ((prev: GroceryItem[]) => GroceryItem[])) => void;
  archivedItems: GroceryItem[];
  setArchivedItems: (items: GroceryItem[] | ((prev: GroceryItem[]) => GroceryItem[])) => void;
  manualItems: GroceryItem[];
  setManualItems: (items: GroceryItem[] | ((prev: GroceryItem[]) => GroceryItem[])) => void;
  availableStores: string[];
  setAvailableStores: (stores: string[]) => void;
}

export const useShoppingListActions = (props: UseShoppingListActionsProps) => {
  // Initialize store actions first so we can use its methods in other actions
  const storeActions = useStoreActions({
    setAvailableStores: props.setAvailableStores,
    groceryItems: props.groceryItems,
    setGroceryItems: props.setGroceryItems
  });

  const itemActions = useItemActions({
    groceryItems: props.groceryItems,
    setGroceryItems: props.setGroceryItems,
    archivedItems: props.archivedItems,
    setArchivedItems: props.setArchivedItems,
    manualItems: props.manualItems,
    setManualItems: props.setManualItems
  });

  const updateActions = useUpdateActions({
    groceryItems: props.groceryItems,
    setGroceryItems: props.setGroceryItems,
    manualItems: props.manualItems,
    setManualItems: props.setManualItems,
    validateStore: storeActions.validateStore
  });

  return {
    ...itemActions,
    ...updateActions,
    ...storeActions
  };
};
