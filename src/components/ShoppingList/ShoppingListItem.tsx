
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
  // Local state to track input values for better UX
  const [quantityValue, setQuantityValue] = useState(item.quantity);
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameValue, setNameValue] = useState(item.name);
  const nameInputRef = useRef<HTMLInputElement>(null);

  // Update local state when item properties change
  useEffect(() => {
    setQuantityValue(item.quantity);
    setNameValue(item.name);
  }, [item.quantity, item.name]);

  // Handle quantity change with immediate update
  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setQuantityValue(newValue);
    // Apply quantity change immediately
    onQuantityChange(item, newValue);
  };
  
  // Start editing name
  const handleNameClick = () => {
    if (onNameChange && !isArchiveView) {
      setIsEditingName(true);
      setTimeout(() => {
        if (nameInputRef.current) {
          nameInputRef.current.focus();
          nameInputRef.current.select();
        }
      }, 10);
    }
  };
  
  // Handle name change
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNameValue(e.target.value);
  };
  
  // Submit name change
  const handleNameSubmit = () => {
    if (onNameChange && nameValue !== item.name) {
      onNameChange(item, nameValue);
    }
    setIsEditingName(false);
  };
  
  // Handle name input keydown
  const handleNameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleNameSubmit();
    } else if (e.key === "Escape") {
      setNameValue(item.name); // Reset to original value
      setIsEditingName(false);
    }
  };

  return (
    <li className="flex items-center gap-3 flex-wrap py-2 border-b border-gray-100">
      <Checkbox
        id={item.id}
        checked={item.checked}
        onCheckedChange={() => onToggle(item.id)}
        disabled={isArchiveView}
      />
      <div 
        className={`flex-1 ${
          item.checked ? "line-through text-gray-400" : ""
        }`}
        onClick={handleNameClick}
      >
        {isEditingName ? (
          <Input
            ref={nameInputRef}
            className="h-8 text-sm"
            value={nameValue}
            onChange={handleNameChange}
            onBlur={handleNameSubmit}
            onKeyDown={handleNameKeyDown}
            autoFocus
          />
        ) : (
          <div className="flex items-center justify-between w-full cursor-pointer">
            <span className="font-medium">{item.name}</span>
            {item.meal && (
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded ml-2 flex-shrink-0">
                {item.meal}
              </span>
            )}
          </div>
        )}
      </div>
      
      <div className="flex items-center gap-2">
        <Input
          className="w-20 h-8 text-sm text-center"
          value={quantityValue}
          onChange={handleQuantityChange}
          onClick={(e) => e.stopPropagation()}
          disabled={isArchiveView}
          placeholder="Qty"
        />
        
        <SimpleStoreSelector
          item={item}
          availableStores={availableStores}
          onStoreChange={onStoreChange}
        />
        
        <div className="text-xs text-gray-500 min-w-16 text-center">
          {item.category}
        </div>
      </div>
    </li>
  );
};
