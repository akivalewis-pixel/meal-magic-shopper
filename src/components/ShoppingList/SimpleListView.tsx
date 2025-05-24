
import React, { useMemo } from "react";
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
  const handleQuantityChange = (item: GroceryItem, quantity: string) => {
    console.log("SimpleListView: Quantity change for", item.name, "from", item.quantity, "to", quantity);
    const updatedItem = {
      ...item,
      quantity,
      __updateTimestamp: Date.now()
    };
    onUpdateItem(updatedItem);
  };

  const handleNameChange = (item: GroceryItem, name: string) => {
    console.log("SimpleListView: Name change for", item.name, "to", name);
    const updatedItem = {
      ...item,
      name,
      __updateTimestamp: Date.now()
    };
    onUpdateItem(updatedItem);
  };

  const handleCategoryChange = (item: GroceryItem, category: string) => {
    const updatedItem = {
      ...item,
      category: category as any,
      __updateTimestamp: Date.now()
    };
    onUpdateItem(updatedItem);
  };

  const handleStoreChange = (updatedItem: GroceryItem, newStore: string) => {
    console.log("SimpleListView: Store change for", updatedItem.name, "to", newStore);
    onUpdateItem(updatedItem);
  };

  // Enhanced grouping with better dependencies and sorting
  const groupedItems = useMemo(() => {
    console.log("SimpleListView: Grouping", items.length, "items, groupByStore:", groupByStore);
    
    // Create a stable key for each item that includes store info
    const itemsWithKeys = items.map(item => ({
      ...item,
      groupKey: `${item.id}-${item.store || 'Unassigned'}-${item.__updateTimestamp || 0}`
    }));
    
    const currentGrouping: Record<string, GroceryItem[]> = {};
    
    if (groupByStore) {
      itemsWithKeys.forEach(item => {
        const store = item.store || "Unassigned";
        if (!currentGrouping[store]) {
          currentGrouping[store] = [];
        }
        currentGrouping[store].push(item);
      });
      
      // Sort items within each store by category
      Object.keys(currentGrouping).forEach(store => {
        currentGrouping[store].sort((a, b) => {
          if (a.category !== b.category) {
            return a.category.localeCompare(b.category);
          }
          return a.name.localeCompare(b.name);
        });
      });
    } else {
      currentGrouping["All Items"] = [...itemsWithKeys];
    }
    
    console.log("SimpleListView: Grouped result:", 
      Object.entries(currentGrouping).map(([store, storeItems]) => ({
        store,
        itemCount: storeItems.length,
        items: storeItems.map(i => ({ name: i.name, store: i.store }))
      }))
    );
    
    return currentGrouping;
  }, [items, groupByStore, items.map(i => i.__updateTimestamp).join(',')]);

  const renderItem = (item: GroceryItem) => {
    const itemKey = `${item.id}-${item.store || 'Unassigned'}-${item.__updateTimestamp || 0}`;
    
    console.log("SimpleListView: Rendering item", item.name, "with key:", itemKey, "store:", item.store);
    
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
  };

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
