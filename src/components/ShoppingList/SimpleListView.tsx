
import React, { useMemo, useCallback, useState } from "react";
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

// Simplified item component with proper name editing
const ItemRow = ({ 
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
  const [localName, setLocalName] = useState(item.name);
  const [isEditingName, setIsEditingName] = useState(false);

  // Update local name when item name changes externally
  React.useEffect(() => {
    setLocalName(item.name);
  }, [item.name]);

  const handleQuantityChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    console.log("SimpleListView: Quantity changing for", item.name, "to", e.target.value);
    const updatedItem = { 
      ...item, 
      quantity: e.target.value
    };
    onUpdateItem(updatedItem);
  }, [item, onUpdateItem]);

  const handleNameInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalName(e.target.value);
  }, []);

  const handleNameCommit = useCallback(() => {
    if (localName !== item.name) {
      console.log("SimpleListView: Name changing for", item.name, "to", localName);
      const updatedItem = { 
        ...item, 
        name: localName
      };
      onUpdateItem(updatedItem);
    }
    setIsEditingName(false);
  }, [item, localName, onUpdateItem]);

  const handleNameKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleNameCommit();
    } else if (e.key === 'Escape') {
      setLocalName(item.name);
      setIsEditingName(false);
    }
  }, [handleNameCommit, item.name]);

  const handleNameClick = useCallback(() => {
    setIsEditingName(true);
  }, []);

  const handleCategoryChange = useCallback((updatedItem: GroceryItem, category: string) => {
    console.log("SimpleListView: Category changed for", updatedItem.name, "to", category);
    const newItem = { 
      ...updatedItem, 
      category: category as any
    };
    onUpdateItem(newItem);
  }, [onUpdateItem]);

  const handleStoreChange = useCallback((updatedItem: GroceryItem) => {
    console.log("SimpleListView: Store changed for", updatedItem.name, "to", updatedItem.store);
    onUpdateItem(updatedItem);
  }, [onUpdateItem]);

  const handleToggle = useCallback(() => {
    console.log("SimpleListView: Removing item from list:", item.name);
    onToggleItem(item.id);
  }, [item.id, onToggleItem]);

  return (
    <li className="flex items-center gap-3 py-2 border-b border-gray-100">
      <Checkbox
        checked={false}
        onCheckedChange={handleToggle}
      />
      
      <div className="flex-1">
        {isEditingName ? (
          <Input
            value={localName}
            onChange={handleNameInputChange}
            onBlur={handleNameCommit}
            onKeyDown={handleNameKeyDown}
            className="border-gray-300 p-1 h-8 font-medium"
            placeholder="Item name"
            autoFocus
          />
        ) : (
          <div onClick={handleNameClick} className="cursor-pointer">
            <span className="font-medium">{item.name}</span>
            {item.meal && (
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded ml-2">
                {item.meal}
              </span>
            )}
          </div>
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
        onCategoryChange={handleCategoryChange}
      />
    </li>
  );
};

export const SimpleListView = React.memo(({
  items,
  availableStores,
  onUpdateItem,
  onToggleItem,
  groupByStore
}: SimpleListViewProps) => {
  // Optimized grouping with stable keys and memoization
  const groupedItems = useMemo(() => {
    console.log("SimpleListView: Grouping items", { groupByStore, itemCount: items.length });
    
    const currentGrouping: Record<string, GroceryItem[]> = {};
    
    if (groupByStore) {
      items.forEach(item => {
        const store = item.store || "Unassigned";
        if (!currentGrouping[store]) {
          currentGrouping[store] = [];
        }
        currentGrouping[store].push(item);
      });
      
      // Sort items within each store by category and name
      Object.keys(currentGrouping).forEach(store => {
        currentGrouping[store].sort((a, b) => {
          if (a.category !== b.category) {
            return a.category.localeCompare(b.category);
          }
          return a.name.localeCompare(b.name);
        });
      });
      
      console.log("SimpleListView: Grouped by store", Object.keys(currentGrouping));
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
        <p>No items match your current filters</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {Object.entries(groupedItems).map(([storeName, storeItems]) => (
        <div key={storeName}>
          {groupByStore && (
            <h3 className="text-lg font-semibold mb-4 pb-2 border-b border-gray-200">
              {storeName} ({storeItems.length} items)
            </h3>
          )}
          <ul className="space-y-1">
            {storeItems.map(item => (
              <ItemRow
                key={`${item.id}-${item.__updateTimestamp || 0}`}
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
