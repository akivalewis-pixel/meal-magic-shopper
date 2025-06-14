
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

  const handleDragStart = (e: React.DragEvent) => {
    onDragStart(e, item);
    const target = e.currentTarget as HTMLElement;
    setTimeout(() => target?.classList.add("opacity-50"), 0);
  };

  const handleDragEnd = (e: React.DragEvent) => {
    (e.currentTarget as HTMLElement)?.classList.remove("opacity-50");
  };

  return (
    <Button
      variant={isSelected ? "default" : "outline"}
      size="sm"
      className={cn(
        "w-full h-auto p-2 mb-2 text-left justify-start",
        isMobile ? "cursor-pointer" : "cursor-move",
        isSelected && "ring-2 ring-primary",
        item.checked && "opacity-50 line-through",
        isMobile && "min-h-[50px]"
      )}
      onClick={handleClick}
      onDoubleClick={() => onDoubleClick(item)}
      draggable={!isMobile}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      data-item-id={item.id}
    >
      <div className="w-full text-left">
        <div className="flex items-start justify-between mb-1">
          <span className="font-medium text-sm text-left flex-1 pr-2">{item.name}</span>
          {onCategoryChange && (
            <div className="flex-shrink-0">
              <CategoryDropdown
                item={item}
                onCategoryChange={onCategoryChange}
                customCategories={customCategories}
                onAddCustomCategory={onAddCustomCategory}
              />
            </div>
          )}
        </div>
        <div className="text-xs text-muted-foreground text-left">
          <span className="mr-2">{item.quantity}</span>
          {item.meal && <span>({item.meal})</span>}
        </div>
      </div>
    </Button>
  );
};
