
import React, { useState } from "react";
import { GroceryItem, GroceryCategory } from "@/types";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Plus, ChevronDown } from "lucide-react";
import { useCustomCategories } from "./useCustomCategories";

interface CategoryDropdownProps {
  item: GroceryItem;
  onCategoryChange: (item: GroceryItem, category: string) => void;
  customCategories?: string[];
  onAddCustomCategory?: (categoryName: string) => void;
}

export const CategoryDropdown = ({
  item,
  onCategoryChange,
  customCategories: propCustomCategories,
  onAddCustomCategory: propOnAddCustomCategory
}: CategoryDropdownProps) => {
  const { customCategories: hookCustomCategories, addCustomCategory: hookAddCustomCategory } = useCustomCategories();
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  // Use prop values if provided, otherwise use hook values
  const customCategories = propCustomCategories || hookCustomCategories;
  const addCustomCategory = propOnAddCustomCategory || hookAddCustomCategory;

  // Default categories from types
  const defaultCategories: GroceryCategory[] = [
    "produce", "dairy", "meat", "grains", "frozen", "pantry", "spices", "other"
  ];

  const handleCategorySelect = (category: string) => {
    console.log("CategoryDropdown: Selecting category", category, "for item", item.name);
    console.log("CategoryDropdown: Current item category:", item.category);
    onCategoryChange(item, category);
    setIsOpen(false);
  };

  const handleAddNewCategory = () => {
    if (newCategoryName.trim()) {
      console.log("CategoryDropdown: Adding new category:", newCategoryName.trim());
      addCustomCategory(newCategoryName.trim());
      onCategoryChange(item, newCategoryName.trim());
      setNewCategoryName("");
      setIsAddingNew(false);
      setIsOpen(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddNewCategory();
    } else if (e.key === 'Escape') {
      setIsAddingNew(false);
      setNewCategoryName("");
    }
  };

  const allCategories = [
    ...defaultCategories.map(cat => ({ name: cat, isDefault: true })),
    ...customCategories.map(cat => ({ name: cat, isDefault: false }))
  ];

  const displayCategoryName = (category: string) => {
    return category.charAt(0).toUpperCase() + category.slice(1);
  };

  const handleTriggerClick = (e: React.MouseEvent) => {
    console.log("CategoryDropdown: Trigger clicked for item:", item.name);
    e.stopPropagation(); // Prevent parent button click
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="h-8 text-xs min-w-20 justify-between"
          onClick={handleTriggerClick}
        >
          <span className="truncate">{displayCategoryName(item.category)}</span>
          <ChevronDown className="h-3 w-3 ml-1 flex-shrink-0" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 bg-white z-50">
        {allCategories.map(({ name, isDefault }) => (
          <DropdownMenuItem
            key={name}
            onClick={() => handleCategorySelect(name)}
            className={item.category === name ? "bg-accent" : ""}
          >
            {displayCategoryName(name)}
            {!isDefault && <span className="text-xs text-muted-foreground ml-auto">Custom</span>}
          </DropdownMenuItem>
        ))}
        
        <DropdownMenuSeparator />
        
        {isAddingNew ? (
          <div className="p-2">
            <Input
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={handleAddNewCategory}
              placeholder="New category name"
              className="h-8 text-xs"
              autoFocus
            />
          </div>
        ) : (
          <DropdownMenuItem
            onClick={() => setIsAddingNew(true)}
            className="text-blue-600"
          >
            <Plus className="h-3 w-3 mr-2" />
            Add New Category
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
