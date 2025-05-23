
import React from "react";
import { GroceryItem } from "@/types";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { SimpleStoreDropdown } from "./SimpleStoreDropdown";

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
    onUpdateItem({ ...item, quantity });
  };

  const handleNameChange = (item: GroceryItem, name: string) => {
    onUpdateItem({ ...item, name });
  };

  const handleStoreChange = (updatedItem: GroceryItem, newStore: string) => {
    console.log("SimpleListView: Store change for", updatedItem.name, "to", newStore);
    // Ensure the store is properly set and force a re-render
    const itemWithNewStore = { 
      ...updatedItem, 
      store: newStore,
      __updateTimestamp: Date.now()
    };
    onUpdateItem(itemWithNewStore);
  };

  // Group items by store if needed - ensure this is reactive to store changes
  const groupedItems = React.useMemo(() => {
    if (groupByStore) {
      return items.reduce((acc, item) => {
        const store = item.store || "Unassigned";
        if (!acc[store]) acc[store] = [];
        acc[store].push(item);
        return acc;
      }, {} as Record<string, GroceryItem[]>);
    }
    return { "All Items": items };
  }, [items, groupByStore]);

  console.log("SimpleListView: Grouped items:", Object.entries(groupedItems).map(([store, storeItems]) => ({
    store,
    count: storeItems.length,
    items: storeItems.map(i => i.name)
  })));

  const renderItem = (item: GroceryItem) => (
    <li key={`${item.id}-${item.store}-${item.__updateTimestamp || 0}`} className="flex items-center gap-3 py-2 border-b border-gray-100">
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
      
      <span className="text-xs text-gray-500 w-16 text-center capitalize">
        {item.category}
      </span>
    </li>
  );

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
