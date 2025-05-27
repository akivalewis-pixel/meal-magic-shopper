
import { useRef } from "react";

export function useShoppingListSyncState() {
  const isInitializedRef = useRef(false);

  return {
    isInitializedRef
  };
}
