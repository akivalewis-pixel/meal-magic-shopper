
import { useState, useRef } from "react";
import { UnifiedGroceryItem, ItemStatus } from "./useUnifiedShoppingList";

export function useUnifiedShoppingListState() {
  const [items, setItems] = useState<UnifiedGroceryItem[]>([]);
  const [availableStores, setAvailableStores] = useState<string[]>([
    "Unassigned", "Supermarket", "Farmers Market", "Specialty Store"
  ]);
  const storeAssignments = useRef<Map<string, string>>(new Map());
  const isInitializedRef = useRef(false);
  const isProcessingRef = useRef(false);

  return {
    items,
    setItems,
    availableStores,
    setAvailableStores,
    storeAssignments,
    isInitializedRef,
    isProcessingRef
  };
}
