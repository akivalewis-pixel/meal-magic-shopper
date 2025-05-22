
import React, { useState, useEffect, useRef } from "react";
import { GroceryItem } from "@/types";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

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
    <li className="flex items-center gap-3 flex-wrap">
      <Checkbox
        id={item.id}
        checked={item.checked}
        onCheckedChange={() => onToggle(item.id)}
        disabled={isArchiveView}
      />
      <div 
        className={`flex flex-1 items-center ${
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
          <div className="flex items-center gap-2 cursor-pointer">
            <span>{item.name}</span>
            {item.meal && (
              <span className="text-xs text-gray-500">({item.meal})</span>
            )}
          </div>
        )}
      </div>
      
      <div className="flex items-center gap-2 ml-auto sm:ml-0">
        <Input
          className="w-[80px] h-8 text-sm"
          value={quantityValue}
          onChange={handleQuantityChange}
          onClick={(e) => e.stopPropagation()}
          disabled={isArchiveView}
        />
        
        <Select 
          value={item.store || ""}
          onValueChange={(value) => {
            // Ensure the store change is applied immediately 
            // This will call the parent's onStoreChange which updates the item
            onStoreChange(item, value);
          }}
          disabled={isArchiveView}
        >
          <SelectTrigger className="w-[120px] h-8 text-xs">
            <SelectValue placeholder="Select Store" />
          </SelectTrigger>
          <SelectContent>
            {availableStores.map(store => (
              <SelectItem key={store} value={store}>{store}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </li>
  );
};
