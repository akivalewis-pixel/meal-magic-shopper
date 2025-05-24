
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

export const SimpleListView = ({
  items,
  availableStores,
  onUpdateItem,
  onToggleItem,
  groupByStore
}: SimpleListViewProps) => {

  const handleQuantityChange = useCallback((item: GroceryItem, quantity: string) => {
    onUpdateItem({ ...item, quantity });
  }, [onUpdateItem]);

  const handleNameChange = useCallback((item: GroceryItem, name: string) => {
    onUpdateItem({ ...item, name });
  }, [onUpdateItem]);

  const handleCategoryChange = useCallback((item: GroceryItem, category: string) => {
    onUpdateItem({ ...item, category: category as any });
  }, [onUpdateItem]);

  const handleStoreChange = useCallback((updatedItem: GroceryItem, newStore: string) => {
    onUpdateItem(updatedItem);
  }, [onUpdateItem]);

  // Optimized grouping with stable keys
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
      currentGrouping["All Items"] = [...items];
    }
    
    return currentGrouping;
  }, [items, groupByStore]);

  const renderItem = useCallback((item: GroceryItem) => {
    const itemKey = `${item.id}-${item.store}-${item.__updateTimestamp}`;
    
    return (
      <li key={itemKey} className="flex items-center gap-3 py-2 border-b border-gray-100">
        <Checkbox
          checked={item.checked}
          onCheckedChange={() => onToggleItem(item.id)}
        />
        
        <div className={`flex-1 ${item.checked ? "line-through opacity-50" : ""}`}>
          <Input
            value={item.name}
            onChange={(e) => handleNameChange(item, e.target.value)}
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
          onChange={(e) => handleQuantityChange(item, e.target.value)}
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
          onCategoryChange={handleCategoryChange}
        />
      </li>
    );
  }, [availableStores, handleQuantityChange, handleNameChange, handleCategoryChange, handleStoreChange, onToggleItem]);

  return (
    <div className="space-y-6">
      {Object.entries(groupedItems).map(([storeName, storeItems]) => (
        <div key={`${storeName}-${storeItems.length}`}>
          {groupByStore && (
            <h3 className="text-lg font-semibold mb-4 pb-2 border-b">
              {storeName} ({storeItems.length} items)
            </h3>
          )}
          <ul className="space-y-1">
            {storeItems.map(renderItem)}
          </ul>
        </div>
      ))}
    </div>
  );
};
