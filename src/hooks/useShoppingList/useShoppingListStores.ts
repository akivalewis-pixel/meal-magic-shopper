
import { useState, useCallback } from "react";

export function useShoppingListStores(initialStores: string[]) {
  const [availableStores, setAvailableStores] = useState<string[]>(initialStores);

  const updateStores = useCallback((stores: string[]) => {
    setAvailableStores(stores);
  }, []);

  return {
    availableStores,
    setAvailableStores,
    updateStores
  };
}
