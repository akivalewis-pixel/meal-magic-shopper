
import { useState } from "react";

export interface ShoppingListViewState {
  viewMode: "list";
  groupByStore: boolean;
  searchTerm: string;
  selectedStore: string;
  isEditingStores: boolean;
  isAddingItem: boolean;
}

export function useShoppingListState() {
  const [groupByStore, setGroupByStore] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStore, setSelectedStore] = useState<string>("all");
  const [isEditingStores, setIsEditingStores] = useState(false);
  const [isAddingItem, setIsAddingItem] = useState(false);

  return {
    state: {
      viewMode: "list" as const,
      groupByStore,
      searchTerm,
      selectedStore,
      isEditingStores,
      isAddingItem
    },
    actions: {
      setViewMode: () => {}, // No-op since we only support list view now
      setGroupByStore,
      setSearchTerm,
      setSelectedStore,
      setIsEditingStores,
      setIsAddingItem
    }
  };
}
