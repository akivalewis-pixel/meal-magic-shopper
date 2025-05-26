
import { useState } from "react";

export interface ShoppingListViewState {
  viewMode: "list" | "board";
  groupByStore: boolean;
  searchTerm: string;
  selectedStore: string;
  isEditingStores: boolean;
  isAddingItem: boolean;
}

export function useShoppingListState() {
  const [viewMode, setViewMode] = useState<"list" | "board">("list");
  const [groupByStore, setGroupByStore] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStore, setSelectedStore] = useState<string>("all");
  const [isEditingStores, setIsEditingStores] = useState(false);
  const [isAddingItem, setIsAddingItem] = useState(false);

  return {
    state: {
      viewMode,
      groupByStore,
      searchTerm,
      selectedStore,
      isEditingStores,
      isAddingItem
    },
    actions: {
      setViewMode,
      setGroupByStore,
      setSearchTerm,
      setSelectedStore,
      setIsEditingStores,
      setIsAddingItem
    }
  };
}
