
import React, { useState, useCallback } from "react";
import { GroceryItem } from "@/types";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { SimpleStoreDropdown } from "./SimpleStoreDropdown";
import { CategoryDropdown } from "./CategoryDropdown";

interface ItemRowProps {
  item: GroceryItem;
  onUpdateItem: (item: GroceryItem) => void;
  onToggleItem: (id: string) => void;
  availableStores: string[];
}

export const ItemRow = ({ 
  item, 
  onUpdateItem, 
  onToggleItem, 
  availableStores
}: ItemRowProps) => {
  const [localName, setLocalName] = useState(item.name);
  const [localQuantity, setLocalQuantity] = useState(item.quantity);
  const [isEditingName, setIsEditingName] = useState(false);

  // Update local states when item changes externally
  React.useEffect(() => {
    setLocalName(item.name);
  }, [item.name]);

  React.useEffect(() => {
    setLocalQuantity(item.quantity);
  }, [item.quantity]);

  const handleQuantityInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalQuantity(e.target.value);
  }, []);

  const handleQuantityCommit = useCallback(() => {
    if (localQuantity !== item.quantity) {
      console.log("ItemRow: Quantity committing for", item.name, "to", localQuantity);
      const updatedItem = { 
        ...item,
        name: localName,
        quantity: localQuantity,
        __updateTimestamp: Date.now()
      };
      onUpdateItem(updatedItem);
    }
  }, [item, localName, localQuantity, onUpdateItem]);

  const handleNameInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalName(e.target.value);
  }, []);

  const handleNameCommit = useCallback(() => {
    if (localName !== item.name) {
      console.log("ItemRow: Name changing for", item.name, "to", localName);
      const updatedItem = { 
        ...item, 
        name: localName,
        __updateTimestamp: Date.now()
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
    console.log("ItemRow: Category changed for", updatedItem.name, "from", updatedItem.category, "to", category);
    const newItem = { 
      ...updatedItem,
      name: localName, // Preserve any name edits in progress
      category: category as any,
      __updateTimestamp: Date.now()
    };
    console.log("ItemRow: Calling onUpdateItem with category change:", newItem);
    onUpdateItem(newItem);
  }, [localName, onUpdateItem]);

  const handleStoreChange = useCallback((updatedItem: GroceryItem) => {
    console.log("ItemRow: Store changed for", updatedItem.name, "to", updatedItem.store);
    // Preserve any name edits in progress
    const newItem = { ...updatedItem, name: localName };
    onUpdateItem(newItem);
  }, [localName, onUpdateItem]);

  const handleToggle = useCallback(() => {
    console.log("ItemRow: Toggling/Checking item:", item.name, "with ID:", item.id);
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
          value={localQuantity}
          onChange={handleQuantityInputChange}
          onBlur={handleQuantityCommit}
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
        />
      </div>
    </li>
  );
};
