
import React, { useState } from "react";
import { GroceryItem, GroceryCategory } from "@/types";
import { Input } from "@/components/ui/input";

interface CategoryEditInputProps {
  item: GroceryItem;
  onCategoryChange: (item: GroceryItem, category: string) => void;
}

export const CategoryEditInput = ({
  item,
  onCategoryChange
}: CategoryEditInputProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(item.category);

  const handleClick = () => {
    setIsEditing(true);
    setEditValue(item.category);
  };

  const handleSubmit = () => {
    if (editValue.trim() && editValue !== item.category) {
      onCategoryChange(item, editValue.trim());
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSubmit();
    } else if (e.key === "Escape") {
      setIsEditing(false);
      setEditValue(item.category);
    }
  };

  if (isEditing) {
    return (
      <Input
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={handleSubmit}
        onKeyDown={handleKeyDown}
        className="w-20 h-8 text-xs"
        placeholder="Category"
        autoFocus
      />
    );
  }

  return (
    <span 
      className="text-xs text-gray-500 w-20 text-center capitalize cursor-pointer hover:bg-gray-100 px-2 py-1 rounded"
      onClick={handleClick}
    >
      {item.category}
    </span>
  );
};
