
import React, { useState } from "react";
import { Input } from "@/components/ui/input";

interface CategoryHeaderProps {
  categoryName: string;
  originalCategoryName: string;
  customCategoryNames?: Record<string, string>;
  onCategoryNameChange?: (oldName: string, newName: string) => void;
  itemCount: number;
}

export const CategoryHeader = ({ 
  categoryName, 
  originalCategoryName,
  customCategoryNames,
  onCategoryNameChange,
  itemCount 
}: CategoryHeaderProps) => {
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
