
import React, { useMemo, useCallback, useState } from "react";
import { GroceryItem } from "@/types";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { SimpleStoreDropdown } from "./SimpleStoreDropdown";
import { CategoryDropdown } from "./CategoryDropdown";
import { useCustomCategories } from "./useCustomCategories";
import { useIsMobile } from "@/hooks/use-mobile";

interface SimpleListViewProps {
  items: GroceryItem[];
  availableStores: string[];
  onUpdateItem: (item: GroceryItem) => void;
  onToggleItem: (id: string) => void;
  groupByStore: boolean;
  customCategoryNames?: Record<string, string>;
  onCategoryNameChange?: (oldName: string, newName: string) => void;
}

// Simplified item component with proper name editing
const ItemRow = ({ 
  item, 
  onUpdateItem, 
  onToggleItem, 
  availableStores,
  customCategories,
  onAddCustomCategory
}: { 
  item: GroceryItem;
  onUpdateItem: (item: GroceryItem) => void;
  onToggleItem: (id: string) => void;
  availableStores: string[];
  customCategories: string[];
  onAddCustomCategory: (categoryName: string) => void;
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
    console.log("SimpleListView: Toggling/Checking item:", item.name, "with ID:", item.id);
    // Use onToggleItem directly - this will remove the item from the UI
    onToggleItem(item.id);
  }, [item.id, item.name, onToggleItem]);

  return (
    <li className="flex items-center gap-3 py-2 border-b border-gray-100">
      <Checkbox
        checked={false} // Items in this view should never be checked
        onCheckedChange={handleToggle}
        className="flex-shrink-0"
      />
      
      <div className="flex-1 min-w-0">
        {isEditingName ? (
          <Input
            value={localName}
            onChange={handleNameInputChange}
            onBlur={handleNameCommit}
            onKeyDown={handleNameKeyDown}
            className="border-gray-300 p-1 h-8 font-medium text-left"
            placeholder="Item name"
            autoFocus
          />
        ) : (
          <div onClick={handleNameClick} className="cursor-pointer text-left">
            <span className="font-medium text-left">{item.name}</span>
            {item.meal && (
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded ml-2">
                {item.meal}
              </span>
            )}
          </div>
        )}
      </div>
      
      <div className="flex items-center gap-2 flex-shrink-0">
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
        
        <CategoryDropdown
          item={item}
          onCategoryChange={handleCategoryChange}
          customCategories={customCategories}
          onAddCustomCategory={onAddCustomCategory}
        />
      </div>
    </li>
  );
};

// Category header component for editing category names
const CategoryHeader = ({ 
  categoryName, 
  originalCategoryName,
  customCategoryNames,
  onCategoryNameChange,
  itemCount 
}: {
  categoryName: string;
  originalCategoryName: string;
  customCategoryNames?: Record<string, string>;
  onCategoryNameChange?: (oldName: string, newName: string) => void;
  itemCount: number;
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(categoryName);

  // Update editValue when categoryName changes (due to custom names)
  React.useEffect(() => {
    setEditValue(categoryName);
  }, [categoryName]);

  const handleClick = () => {
    if (onCategoryNameChange) {
      setIsEditing(true);
      setEditValue(categoryName);
    }
  };

  const handleSubmit = () => {
    if (onCategoryNameChange && editValue.trim() && editValue !== categoryName) {
      console.log("Category name change - Original:", originalCategoryName, "Display:", categoryName, "New:", editValue.trim());
      // Use the exact original category name as the key (no normalization)
      onCategoryNameChange(originalCategoryName, editValue.trim());
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSubmit();
    } else if (e.key === "Escape") {
      setIsEditing(false);
      setEditValue(categoryName);
    }
  };

  if (isEditing) {
    return (
      <Input
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={handleSubmit}
        onKeyDown={handleKeyDown}
        className="font-medium mb-2 h-8 text-left"
        placeholder="Category name"
        autoFocus
      />
    );
  }

  return (
    <h4 
      className="font-medium mb-2 cursor-pointer hover:text-blue-600 transition-colors text-sm text-gray-600 text-left" 
      onClick={handleClick}
    >
      {categoryName} ({itemCount} items)
    </h4>
  );
};

export const SimpleListView = React.memo(({
  items,
  availableStores,
  onUpdateItem,
  onToggleItem,
  groupByStore,
  customCategoryNames = {},
  onCategoryNameChange
}: SimpleListViewProps) => {
  const isMobile = useIsMobile();
  const { customCategories, addCustomCategory } = useCustomCategories();
  
  // Items should only include unchecked items
  const activeItems = items.filter(item => !item.checked);
  console.log("SimpleListView: Displaying", activeItems.length, "active items out of", items.length, "total items");

  // Function to get the display category name (custom or default) - simplified
  const getDisplayCategoryName = useCallback((categoryName: string): string => {
    console.log("SimpleListView: Getting display name for category:", categoryName, "Custom names:", customCategoryNames);
    
    // Try exact match first
    if (customCategoryNames[categoryName]) {
      console.log("SimpleListView: Found exact match:", customCategoryNames[categoryName]);
      return customCategoryNames[categoryName];
    }
    
    // Return capitalized version as default
    const displayName = categoryName.charAt(0).toUpperCase() + categoryName.slice(1);
    console.log("SimpleListView: Using default display name:", displayName);
    return displayName;
  }, [customCategoryNames]);

  // Optimized grouping with stable keys and memoization
  const groupedItems = useMemo(() => {
    console.log("SimpleListView: Grouping items", { groupByStore, itemCount: activeItems.length });
    console.log("SimpleListView: Custom category names:", customCategoryNames);
    
    const currentGrouping: Record<string, Record<string, GroceryItem[]>> = {};
    
    if (groupByStore) {
      activeItems.forEach(item => {
        const store = item.store || "Unassigned";
        const category = item.category;
        
        if (!currentGrouping[store]) {
          currentGrouping[store] = {};
        }
        if (!currentGrouping[store][category]) {
          currentGrouping[store][category] = [];
        }
        currentGrouping[store][category].push(item);
      });
      
      // Sort items within each category by name
      Object.keys(currentGrouping).forEach(store => {
        Object.keys(currentGrouping[store]).forEach(category => {
          currentGrouping[store][category].sort((a, b) => a.name.localeCompare(b.name));
        });
      });
      
      console.log("SimpleListView: Grouped by store", Object.keys(currentGrouping));
    } else {
      // Group by category only
      const categoryGrouping: Record<string, GroceryItem[]> = {};
      activeItems.forEach(item => {
        const category = item.category;
        if (!categoryGrouping[category]) {
          categoryGrouping[category] = [];
        }
        categoryGrouping[category].push(item);
      });
      
      // Sort items within each category by name
      Object.keys(categoryGrouping).forEach(category => {
        categoryGrouping[category].sort((a, b) => a.name.localeCompare(b.name));
      });
      
      currentGrouping["All Items"] = categoryGrouping;
    }
    
    return currentGrouping;
  }, [activeItems, groupByStore, customCategoryNames]);

  if (activeItems.length === 0) {
    return (
      <div className="text-center py-10 text-gray-500">
        <p>No active items in your shopping list</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {Object.entries(groupedItems).map(([storeName, storeCategories]) => (
        <div key={storeName} className={isMobile ? "pb-2" : ""}>
          {groupByStore && (
            <h3 className="text-lg font-semibold mb-3 pb-1 border-b border-gray-200 text-left">
              {storeName} ({Object.values(storeCategories).flat().length} items)
            </h3>
          )}
          
          {Object.entries(storeCategories).map(([categoryName, categoryItems]) => (
            <div key={`${storeName}-${categoryName}`} className="mb-3 sm:mb-4">
              <CategoryHeader
                categoryName={getDisplayCategoryName(categoryName)}
                originalCategoryName={categoryName}
                customCategoryNames={customCategoryNames}
                onCategoryNameChange={onCategoryNameChange}
                itemCount={categoryItems.length}
              />
              <ul className={`space-y-${isMobile ? "2" : "1"}`}>
                {categoryItems.map(item => (
                  <ItemRow
                    key={`${item.id}-${item.__updateTimestamp || 0}`}
                    item={item}
                    onUpdateItem={onUpdateItem}
                    onToggleItem={onToggleItem}
                    availableStores={availableStores}
                    customCategories={customCategories}
                    onAddCustomCategory={addCustomCategory}
                  />
                ))}
              </ul>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
});

SimpleListView.displayName = 'SimpleListView';
