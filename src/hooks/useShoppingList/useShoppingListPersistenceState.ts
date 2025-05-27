
import { useRef } from "react";

export function useShoppingListPersistenceState() {
  const storeAssignments = useRef<Map<string, string>>(new Map());
  const lastSavedAssignments = useRef<string>('');
  const isInitializedRef = useRef(false);
  const isProcessingRef = useRef(false);

  return {
    storeAssignments,
    lastSavedAssignments,
    isInitializedRef,
    isProcessingRef
  };
}
