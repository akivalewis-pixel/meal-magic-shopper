import React, { useState, useEffect } from "react";
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
import { useCustomCategories } from "@/contexts/CustomCategoriesContext";

interface CategoryDropdownProps {
  item: GroceryItem;
  onCategoryChange: (item: GroceryItem, category: string) => void;
}

export const CategoryDropdown = ({
  item,
  onCategoryChange
}: CategoryDropdownProps) => {
  const { 
    customCategories, 
    addCustomCategory,
    defaultCategoryOverrides,
    getCategoryDisplayName,
    getAllCategories
  } = useCustomCategories();
  
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [allCategories, setAllCategories] = useState<Array<{name: string, isDefault: boolean, displayName: string}>>([]);

  // Default categories from types
  const defaultCategories: GroceryCategory[] = [
    "produce", "dairy", "meat", "grains", "frozen", "pantry", "spices", "other"
  ];

  // Update categories whenever dependencies change
  useEffect(() => {
    const updatedCategories = [
      ...defaultCategories.map(cat => ({ 
        name: cat, 
        isDefault: true,
        displayName: getCategoryDisplayName(cat)
      })),
      ...customCategories.map(cat => ({ 
        name: cat, 
        isDefault: false,
        displayName: cat.charAt(0).toUpperCase() + cat.slice(1)
      }))
    ];
    setAllCategories(updatedCategories);
    console.log("CategoryDropdown: Updated categories list:", updatedCategories);
  }, [customCategories, defaultCategoryOverrides, getCategoryDisplayName]);

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

  const handleTriggerClick = (e: React.MouseEvent) => {
    console.log("CategoryDropdown: Trigger clicked for item:", item.name);
    e.stopPropagation(); // Prevent parent button click
  };

  const getCurrentDisplayName = () => {
    return getCategoryDisplayName(item.category);
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
          <span className="truncate">{getCurrentDisplayName()}</span>
          <ChevronDown className="h-3 w-3 ml-1 flex-shrink-0" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 bg-white z-50">
        {allCategories.map(({ name, isDefault, displayName }) => (
          <DropdownMenuItem
            key={name}
            onClick={() => handleCategorySelect(name)}
            className={item.category === name ? "bg-accent" : ""}
          >
            {displayName}
            {!isDefault && <span className="text-xs text-muted-foreground ml-auto">Custom</span>}
            {isDefault && defaultCategoryOverrides[name] && (
              <span className="text-xs text-blue-600 ml-auto">Renamed</span>
            )}
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