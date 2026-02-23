
import React, { useState, useCallback } from "react";
import { GroceryItem } from "@/types";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { SimpleStoreDropdown } from "./SimpleStoreDropdown";
import { CategoryDropdown } from "./CategoryDropdown";
import { useIsMobile } from "@/hooks/use-mobile";

interface ItemRowProps {
  item: GroceryItem;
  onUpdateItem: (item: GroceryItem) => void;
  onToggleItem: (id: string) => void;
  onDeleteItem?: (id: string) => void;
  availableStores: string[];
  onAddStore?: (store: string) => void;
}

export const ItemRow = ({ 
  item, 
  onUpdateItem, 
  onToggleItem,
  onDeleteItem,
  availableStores,
  onAddStore
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

  const isMobile = useIsMobile();

  return (
    <li className={`flex ${isMobile ? 'flex-col gap-1' : 'items-center gap-3'} py-2 border-b border-border`}>
      <div className="flex items-center gap-3">
        <Checkbox
          checked={false}
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
              className="border-border p-1 h-8 font-medium text-left"
              placeholder="Item name"
              autoFocus
            />
          ) : (
            <div onClick={handleNameClick} className="cursor-pointer text-left">
              <span className="font-medium text-left">{item.name}</span>
              {item.meal && (
                <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded ml-2">
                  {item.meal}
                </span>
              )}
            </div>
          )}
        </div>

        {!isMobile && onDeleteItem && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 flex-shrink-0 text-muted-foreground hover:text-destructive"
            onClick={() => onDeleteItem(item.id)}
            title="Delete item permanently"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>
      
      <div className={`flex items-center gap-2 ${isMobile ? 'pl-9' : ''} flex-shrink-0`}>
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
          onAddStore={onAddStore}
        />
        
        <CategoryDropdown
          item={item}
          onCategoryChange={handleCategoryChange}
        />

        {isMobile && onDeleteItem && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 flex-shrink-0 text-muted-foreground hover:text-destructive"
            onClick={() => onDeleteItem(item.id)}
            title="Delete item permanently"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>
    </li>
  );
};
