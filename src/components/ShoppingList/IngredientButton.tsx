
import React from "react";
import { GroceryItem } from "@/types";
import { Button } from "@/components/ui/button";
import { CategoryDropdown } from "./CategoryDropdown";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

interface IngredientButtonProps {
  item: GroceryItem;
  isSelected: boolean;
  onSelect: (id: string, isMultiSelect: boolean) => void;
  onDoubleClick: (item: GroceryItem) => void;
  onDragStart: (e: React.DragEvent, item: GroceryItem) => void;
  customCategories?: string[];
  onAddCustomCategory?: (categoryName: string) => void;
  onCategoryChange?: (item: GroceryItem, category: string) => void;
}

export const IngredientButton = ({
  item,
  isSelected,
  onSelect,
  onDoubleClick,
  onDragStart,
  customCategories = [],
  onAddCustomCategory,
  onCategoryChange
}: IngredientButtonProps) => {
  const isMobile = useIsMobile();

  const handleClick = (e: React.MouseEvent) => {
    const isMultiSelect = e.ctrlKey || e.metaKey || e.shiftKey;
    onSelect(item.id, isMultiSelect);
  };

  const handleDoubleClick = () => {
    onDoubleClick(item);
  };

  const handleDragStart = (e: React.DragEvent) => {
    onDragStart(e, item);
    
    const target = e.currentTarget as HTMLElement;
    setTimeout(() => {
      if (target) target.classList.add("opacity-50");
    }, 0);
  };

  const handleDragEnd = (e: React.DragEvent) => {
    const target = e.currentTarget as HTMLElement;
    if (target) target.classList.remove("opacity-50");
  };

  const handleCategoryChange = (item: GroceryItem, category: string) => {
    if (onCategoryChange) {
      onCategoryChange(item, category);
    }
  };

  return (
    <Button
      variant={isSelected ? "default" : "outline"}
      size="sm"
      className={cn(
        "w-full justify-start text-left h-auto p-2 sm:p-3 mb-2",
        // On mobile, make it easier to tap without accidental drags
        isMobile ? "cursor-pointer" : "cursor-move",
        isSelected && "ring-2 ring-primary",
        item.checked && "opacity-50 line-through",
        // Increase touch target size on mobile
        isMobile && "min-h-[50px]"
      )}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      draggable={!isMobile}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      data-item-id={item.id}
    >
      <div className="flex flex-col items-start w-full text-left justify-start">
        <div className="flex justify-between items-center w-full mb-1">
          <div className="font-medium text-sm text-left flex-shrink-0">{item.name}</div>
          {onCategoryChange && (
            <CategoryDropdown
              item={item}
              onCategoryChange={handleCategoryChange}
              customCategories={customCategories}
              onAddCustomCategory={onAddCustomCategory}
            />
          )}
        </div>
        <div className="text-xs text-muted-foreground flex justify-between w-full text-left items-start">
          <span className="text-left">{item.quantity}</span>
          {item.meal && <span className="text-left">({item.meal})</span>}
        </div>
      </div>
    </Button>
  );
};
