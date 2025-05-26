
import { Meal, GroceryItem } from "@/types";
import { useUnifiedShoppingListState } from "./useUnifiedShoppingListState";
import { useUnifiedShoppingListStorage } from "./useUnifiedShoppingListStorage";
import { useUnifiedShoppingListSync } from "./useUnifiedShoppingListSync";
import { useUnifiedShoppingListActions } from "./useUnifiedShoppingListActions";

export type ItemStatus = 'active' | 'checked' | 'archived';

export interface UnifiedGroceryItem extends Omit<GroceryItem, 'checked'> {
  status: ItemStatus;
  source: 'meal' | 'manual';
  mealId?: string;
  originalMealData?: Partial<GroceryItem>;
}

export function useUnifiedShoppingList(meals: Meal[], pantryItems: string[] = []) {
  const {
    items,
    setItems,
    availableStores,
    setAvailableStores,
    storeAssignments,
    isInitializedRef,
    isProcessingRef
  } = useUnifiedShoppingListState();

  useUnifiedShoppingListStorage({
    items,
    availableStores,
    storeAssignments,
    isInitializedRef,
    isProcessingRef,
    setItems,
    setAvailableStores
  });

  useUnifiedShoppingListSync({
    meals,
    pantryItems,
    items,
    setItems,
    storeAssignments,
    isInitializedRef
  });

  const {
    toggleItem,
    archiveItem,
    updateItem,
    addItem,
    resetList
  } = useUnifiedShoppingListActions({
    items,
    setItems,
    storeAssignments,
    isProcessingRef
  });

  // Get items by status
  const activeItems = items.filter(item => item.status === 'active');
  const checkedItems = items.filter(item => item.status === 'checked');
  const archivedItems = items.filter(item => item.status === 'archived');

  // Convert to legacy format for compatibility
  const groceryItems: GroceryItem[] = activeItems.map(item => ({
    id: item.id,
    name: item.name,
    category: item.category,
    quantity: item.quantity,
    checked: false,
    meal: item.mealId,
    store: item.store,
    department: item.department,
    __updateTimestamp: item.__updateTimestamp
  }));

  const archivedGroceryItems: GroceryItem[] = [...checkedItems, ...archivedItems].map(item => ({
    id: item.id,
    name: item.name,
    category: item.category,
    quantity: item.quantity,
    checked: true,
    meal: item.mealId,
    store: item.store,
    department: item.department,
    __updateTimestamp: item.__updateTimestamp
  }));

  return {
    groceryItems,
    archivedItems: archivedGroceryItems,
    availableStores,
    updateItem: (item: GroceryItem) => {
      const unifiedItem: UnifiedGroceryItem = {
        ...item,
        status: item.checked ? 'checked' : 'active',
        source: item.id.startsWith('manual-') ? 'manual' : 'meal'
      };
      updateItem(unifiedItem);
    },
    toggleItem,
    archiveItem,
    addItem,
    updateStores: setAvailableStores,
    resetList
  };
}
