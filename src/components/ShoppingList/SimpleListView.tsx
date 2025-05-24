
import React, { useMemo, useCallback } from "react";
import { GroceryItem } from "@/types";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { SimpleStoreDropdown } from "./SimpleStoreDropdown";
import { CategoryEditInput } from "./CategoryEditInput";

interface SimpleListViewProps {
  items: GroceryItem[];
  availableStores: string[];
  onUpdateItem: (item: GroceryItem) => void;
  onToggleItem: (id: string) => void;
  groupByStore: boolean;
}

// Memoized item component to prevent unnecessary re-renders
const MemoizedItemRow = React.memo(({ 
  item, 
  onUpdateItem, 
  onToggleItem, 
  availableStores 
}: { 
  item: GroceryItem;
  onUpdateItem: (item: GroceryItem) => void;
  onToggleItem: (id: string) => void;
  availableStores: string[];
}) => {
  const handleQuantityChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdateItem({ ...item, quantity: e.target.value });
  }, [item, onUpdateItem]);

  const handleNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdateItem({ ...item, name: e.target.value });
  }, [item, onUpdateItem]);

  const handleCategoryChange = useCallback((category: string) => {
    onUpdateItem({ ...item, category: category as any });
  }, [item, onUpdateItem]);

  const handleStoreChange = useCallback((updatedItem: GroceryItem) => {
    onUpdateItem(updatedItem);
  }, [onUpdateItem]);

  const handleToggle = useCallback(() => {
    onToggleItem(item.id);
  }, [item.id, onToggleItem]);

  return (
    <li className="flex items-center gap-3 py-2 border-b border-gray-100">
      <Checkbox
        checked={item.checked}
        onCheckedChange={handleToggle}
      />
      
      <div className={`flex-1 ${item.checked ? "line-through opacity-50" : ""}`}>
        <Input
          value={item.name}
          onChange={handleNameChange}
          className="border-none p-0 h-auto font-medium"
        />
        {item.meal && (
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded ml-2">
            {item.meal}
          </span>
        )}
      </div>
      
      <Input
        value={item.quantity}
        onChange={handleQuantityChange}
        className="w-20 h-8 text-center"
        placeholder="Qty"
      />
      
      <SimpleStoreDropdown
        item={item}
        availableStores={availableStores}
        onStoreChange={handleStoreChange}
      />
      
      <CategoryEditInput
        item={item}
        onCategoryChange={(item, category) => handleCategoryChange(category)}
      />
    </li>
  );
});

MemoizedItemRow.displayName = 'MemoizedItemRow';

export const SimpleListView = React.memo(({
  items,
  availableStores,
  onUpdateItem,
  onToggleItem,
  groupByStore
}: SimpleListViewProps) => {
  // Optimized grouping with stable keys and memoization
  const groupedItems = useMemo(() => {
    const currentGrouping: Record<string, GroceryItem[]> = {};
    
    if (groupByStore) {
      items.forEach(item => {
        const store = item.store || "Unassigned";
        if (!currentGrouping[store]) {
          currentGrouping[store] = [];
        }
        currentGrouping[store].push(item);
      });
      
      // Sort items within each store
      Object.keys(currentGrouping).forEach(store => {
        currentGrouping[store].sort((a, b) => {
          if (a.category !== b.category) {
            return a.category.localeCompare(b.category);
          }
          return a.name.localeCompare(b.name);
        });
      });
    } else {
      currentGrouping["All Items"] = [...items].sort((a, b) => {
        if (a.category !== b.category) {
          return a.category.localeCompare(b.category);
        }
        return a.name.localeCompare(b.name);
      });
    }
    
    return currentGrouping;
  }, [items, groupByStore]);

  if (items.length === 0) {
    return (
      <div className="text-center py-10 text-gray-500">
        <p>No items in your shopping list</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {Object.entries(groupedItems).map(([storeName, storeItems]) => (
        <div key={storeName}>
          {groupByStore && (
            <h3 className="text-lg font-semibold mb-4 pb-2 border-b">
              {storeName} ({storeItems.length} items)
            </h3>
          )}
          <ul className="space-y-1">
            {storeItems.map(item => (
              <MemoizedItemRow
                key={item.id}
                item={item}
                onUpdateItem={onUpdateItem}
                onToggleItem={onToggleItem}
                availableStores={availableStores}
              />
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
});

SimpleListView.displayName = 'SimpleListView';
