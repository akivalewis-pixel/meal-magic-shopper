
import { GroceryItem, Meal } from "@/types";
import { useShoppingListItemsState } from "./useShoppingListItemsState";
import { useShoppingListItemsEffects } from "./useShoppingListItemsEffects";
import { useShoppingListItemsActions } from "./useShoppingListItemsActions";

interface UseShoppingListItemsProps {
  meals: Meal[];
  pantryItems: string[];
  isInitialized: React.MutableRefObject<boolean>;
  removedItemIds: React.MutableRefObject<Set<string>>;
  storeAssignments: React.MutableRefObject<Map<string, string>>;
  saveToStorage: (groceryItems: GroceryItem[], archivedItems: GroceryItem[], availableStores: string[]) => void;
  initialItems: GroceryItem[];
  initialArchived: GroceryItem[];
}

export function useShoppingListItems({
  meals,
  pantryItems,
  isInitialized,
  removedItemIds,
  storeAssignments,
  saveToStorage,
  initialItems,
  initialArchived
}: UseShoppingListItemsProps) {
  const {
    groceryItems,
    archivedItems,
    setGroceryItems,
    setArchivedItems
  } = useShoppingListItemsState(initialItems, initialArchived);

  useShoppingListItemsEffects({
    meals,
    pantryItems,
    isInitialized,
    removedItemIds,
    storeAssignments,
    groceryItems,
    setGroceryItems
  });

  const actions = useShoppingListItemsActions({
    groceryItems,
    archivedItems,
    setGroceryItems,
    setArchivedItems,
    removedItemIds,
    storeAssignments
  });

  return {
    groceryItems,
    archivedItems,
    setGroceryItems,
    setArchivedItems,
    ...actions
  };
}
