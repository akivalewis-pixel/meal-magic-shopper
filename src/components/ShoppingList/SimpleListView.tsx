
import React from "react";
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

  // Group items by store
  const groupedItems = React.useMemo(() => {
    console.log("SimpleListView: Grouping", items.length, "items");
    
    const currentGrouping: Record<string, GroceryItem[]> = {};
    
    if (groupByStore) {
      items.forEach(item => {
        const store = item.store || "Unassigned";
        if (!currentGrouping[store]) {
          currentGrouping[store] = [];
        }
        currentGrouping[store].push(item);
      });
    } else {
      currentGrouping["All Items"] = [...items];
    }
    
    return currentGrouping;
  }, [items, groupByStore]);

  const renderItem = (item: GroceryItem) => {
    console.log("SimpleListView: Rendering item", item.name, "with quantity:", item.quantity, "timestamp:", item.__updateTimestamp);
    
    return (
      <li key={`${item.id}-${item.__updateTimestamp || 0}`} className="flex items-center gap-3 py-2 border-b border-gray-100">
        <Checkbox
          checked={item.checked}
          onCheckedChange={() => onToggleItem(item.id)}
        />
        
        <div className={`flex-1 ${item.checked ? "line-through opacity-50" : ""}`}>
          <Input
            key={`name-${item.id}-${item.__updateTimestamp || 0}`}
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
          key={`quantity-${item.id}-${item.__updateTimestamp || 0}`}
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
        <div key={storeName}>
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
