
import { useCallback, useRef } from "react";
import { GroceryItem } from "@/types";

// Create a global state reference that can be accessed by the print function
export const shoppingListStateRef = {
  currentItems: [] as GroceryItem[],
  availableStores: [] as string[]
};

export function useShoppingListSync() {
  const syncStateRef = useRef<{
    items: GroceryItem[];
    stores: string[];
  }>({
    items: [],
    stores: []
  });

  // Function to update the global state reference
  const updateGlobalState = useCallback((items: GroceryItem[], stores: string[]) => {
    console.log("ShoppingListSync: Updating global state with", items.length, "items");
    shoppingListStateRef.currentItems = [...items];
    shoppingListStateRef.availableStores = [...stores];
    syncStateRef.current = { items: [...items], stores: [...stores] };
  }, []);

  // Function to get the most current state
  const getCurrentState = useCallback(() => {
    console.log("ShoppingListSync: Getting current state with", syncStateRef.current.items.length, "items");
    return {
      items: [...syncStateRef.current.items],
      stores: [...syncStateRef.current.stores]
    };
  }, []);

  return {
    updateGlobalState,
    getCurrentState
  };
}
