
import React, { useState, useRef } from "react";
import { GroceryItem } from "@/types";
import { ShoppingListItem } from "./ShoppingListItem";
import { Input } from "@/components/ui/input";

interface ShoppingListGroupProps {
  categoryName: string;
  items: GroceryItem[];
  onToggle: (id: string) => void;
  onQuantityChange: (item: GroceryItem, quantity: string) => void;
  onStoreChange: (item: GroceryItem, store: string) => void;
  onNameChange?: (item: GroceryItem, name: string) => void;
  onCategoryNameChange?: (oldName: string, newName: string) => void;
  availableStores: string[];
  isArchiveView?: boolean;
}

export const ShoppingListGroup = ({
  categoryName,
  items,
  onToggle,
  onQuantityChange,
  onStoreChange,
  onNameChange,
  onCategoryNameChange,
  availableStores,
  isArchiveView = false
}: ShoppingListGroupProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(categoryName);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleCategoryClick = () => {
    if (onCategoryNameChange && !isArchiveView) {
      setIsEditing(true);
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          inputRef.current.select();
        }
      }, 10);
    }
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditedName(e.target.value);
  };

  const handleNameSubmit = () => {
    if (onCategoryNameChange && editedName !== categoryName && editedName.trim()) {
      onCategoryNameChange(categoryName, editedName.trim());
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleNameSubmit();
    } else if (e.key === "Escape") {
      setEditedName(categoryName);
      setIsEditing(false);
    }
  };

  return (
    <div className="mb-6 last:mb-0">
      {isEditing ? (
        <Input
          ref={inputRef}
          className="font-medium mb-2"
          value={editedName}
          onChange={handleNameChange}
          onBlur={handleNameSubmit}
          onKeyDown={handleKeyDown}
        />
      ) : (
        <h4 
          className="font-medium mb-2 cursor-pointer hover:text-blue-600 transition-colors" 
          onClick={handleCategoryClick}
        >
          {categoryName}
        </h4>
      )}
      <ul className="space-y-3">
        {items.map((item) => (
          <ShoppingListItem
            key={item.id}
            item={item}
            onToggle={onToggle}
            onQuantityChange={onQuantityChange}
            onStoreChange={onStoreChange}
            onNameChange={onNameChange}
            availableStores={availableStores}
            isArchiveView={isArchiveView}
          />
        ))}
      </ul>
    </div>
  );
};
