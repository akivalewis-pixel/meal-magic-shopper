
import { GroceryItem } from "@/types";
import { useItemUpdateActions } from "./useItemUpdateActions";
import { useItemToggleActions } from "./useItemToggleActions";
import { useItemArchiveActions } from "./useItemArchiveActions";
import { useItemAddActions } from "./useItemAddActions";
import { useStoreUpdateActions } from "./useStoreUpdateActions";
import { useListResetActions } from "./useListResetActions";

interface UseShoppingListActionsProps {
  allItems: GroceryItem[];
  setAllItems: React.Dispatch<React.SetStateAction<GroceryItem[]>>;
  archivedItems: GroceryItem[];
  setArchivedItems: React.Dispatch<React.SetStateAction<GroceryItem[]>>;
  storeAssignments: React.MutableRefObject<Map<string, string>>;
  saveToLocalStorage: () => void;
  setAvailableStores: React.Dispatch<React.SetStateAction<string[]>>;
}

export function useShoppingListActions({
  allItems,
  setAllItems,
  archivedItems,
  setArchivedItems,
  storeAssignments,
  saveToLocalStorage,
  setAvailableStores
}: UseShoppingListActionsProps) {
  const { updateItem } = useItemUpdateActions({
    setAllItems,
    storeAssignments,
    saveToLocalStorage
  });

  const { toggleItem } = useItemToggleActions({
    setAllItems
  });

  const { archiveItem } = useItemArchiveActions({
    allItems,
    setAllItems,
    setArchivedItems
  });

  const { addItem } = useItemAddActions({
    setAllItems,
    saveToLocalStorage
  });

  const { updateStores } = useStoreUpdateActions({
    setAvailableStores,
    setAllItems,
    saveToLocalStorage
  });

  const { resetList } = useListResetActions({
    allItems,
    setAllItems,
    setArchivedItems,
    saveToLocalStorage
  });

  return {
    updateItem,
    toggleItem,
    archiveItem,
    addItem,
    updateStores,
    resetList
  };
}
