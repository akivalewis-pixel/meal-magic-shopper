
import React, { useState, useEffect, useRef } from "react";
import { GroceryItem } from "@/types";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { SimpleStoreSelector } from "./SimpleStoreSelector";

interface ShoppingListItemProps {
  item: GroceryItem;
  onToggle: (id: string) => void;
  onQuantityChange: (item: GroceryItem, quantity: string) => void;
  onStoreChange: (item: GroceryItem, store: string) => void;
  onNameChange?: (item: GroceryItem, name: string) => void;
  availableStores: string[];
  isArchiveView?: boolean;
}

export const ShoppingListItem = ({
  item,
  onToggle,
  onQuantityChange,
  onStoreChange,
  onNameChange,
  availableStores,
  isArchiveView = false
}: ShoppingListItemProps) => {
  const [quantityValue, setQuantityValue] = useState(item.quantity);
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameValue, setNameValue] = useState(item.name);
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setQuantityValue(item.quantity);
    setNameValue(item.name);
  }, [item.quantity, item.name]);

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setQuantityValue(newValue);
    onQuantityChange(item, newValue);
  };
  
  const handleNameClick = () => {
    if (onNameChange && !isArchiveView) {
      setIsEditingName(true);
      setTimeout(() => {
        nameInputRef.current?.focus();
        nameInputRef.current?.select();
      }, 10);
    }
  };
  
  const handleNameSubmit = () => {
    if (onNameChange && nameValue !== item.name) {
      onNameChange(item, nameValue);
    }
    setIsEditingName(false);
  };
  
  const handleNameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleNameSubmit();
    } else if (e.key === "Escape") {
      setNameValue(item.name);
      setIsEditingName(false);
    }
  };

  return (
    <li className="flex items-center justify-start gap-3 py-2 border-b border-gray-100 text-left">
      <Checkbox
        id={item.id}
        checked={item.checked}
        onCheckedChange={() => onToggle(item.id)}
        disabled={isArchiveView}
        className="flex-shrink-0"
      />
      
      <div 
        className={`flex-1 min-w-0 text-left ${item.checked ? "line-through text-gray-400" : ""}`}
        onClick={handleNameClick}
      >
        {isEditingName ? (
          <Input
            ref={nameInputRef}
            className="h-8 text-sm text-left"
            value={nameValue}
            onChange={(e) => setNameValue(e.target.value)}
            onBlur={handleNameSubmit}
            onKeyDown={handleNameKeyDown}
            autoFocus
          />
        ) : (
          <div className="flex items-center justify-start gap-2 text-left">
            <span className="font-medium text-left text-start">{item.name}</span>
            {item.meal && (
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded flex-shrink-0 text-left">
                {item.meal}
              </span>
            )}
          </div>
        )}
      </div>
      
      <div className="flex items-center justify-end gap-2 flex-shrink-0">
        <Input
          className="w-20 h-8 text-sm text-center"
          value={quantityValue}
          onChange={handleQuantityChange}
          disabled={isArchiveView}
          placeholder="Qty"
        />
        
        <SimpleStoreSelector
          item={item}
          availableStores={availableStores}
          onStoreChange={onStoreChange}
        />
        
        <div className="text-xs text-gray-500 min-w-16 text-left">
          {item.category}
        </div>
      </div>
    </li>
  );
};
