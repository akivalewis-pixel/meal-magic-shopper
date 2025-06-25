
import React from "react";
import { GroceryItem } from "@/types";
import { CategoryDropdown } from "./CategoryDropdown";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

interface IngredientButtonProps {
  item: GroceryItem;
  isSelected: boolean;
  onSelect: (id: string, isMultiSelect: boolean) => void;
  onDoubleClick: (item: GroceryItem) => void;
  onDragStart: (e: React.DragEvent, item: GroceryItem) => void;
  onCategoryChange?: (item: GroceryItem, category: string) => void;
  customCategories?: string[];
  onAddCustomCategory?: (categoryName: string) => void;
}

export const IngredientButton = ({
  item,
  isSelected,
  onSelect,
  onDoubleClick,
  onDragStart,
  onCategoryChange,
  customCategories,
  onAddCustomCategory
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
    <div
      className={cn(
        // Base styles matching button appearance
        "w-full h-auto p-3 mb-2 rounded-md text-sm font-medium transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "border text-left flex flex-col items-start justify-start",
        // Variant styles
        isSelected
          ? "bg-primary text-primary-foreground hover:bg-primary/90"
          : "border-input bg-background hover:bg-accent hover:text-accent-foreground",
        // State styles
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
      <div className="w-full flex flex-col items-start justify-start text-left">
        <div className="w-full flex items-start justify-between gap-2 mb-1 text-left">
          <span className="font-medium text-sm text-left flex-1">{item.name}</span>
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
        <div className="w-full text-xs text-muted-foreground text-left flex items-center justify-start gap-2">
          <span className="text-left">{item.quantity}</span>
          {item.meal && <span className="text-left">({item.meal})</span>}
        </div>
      </div>
    </div>
  );
};
