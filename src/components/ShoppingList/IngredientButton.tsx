
import React from "react";
import { GroceryItem } from "@/types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface IngredientButtonProps {
  item: GroceryItem;
  isSelected: boolean;
  onSelect: (id: string, isMultiSelect: boolean) => void;
  onDoubleClick: (item: GroceryItem) => void;
  onDragStart: (e: React.DragEvent, item: GroceryItem) => void;
}

export const IngredientButton = ({
  item,
  isSelected,
  onSelect,
  onDoubleClick,
  onDragStart
}: IngredientButtonProps) => {
  const handleClick = (e: React.MouseEvent) => {
    const isMultiSelect = e.ctrlKey || e.metaKey || e.shiftKey;
    onSelect(item.id, isMultiSelect);
  };

  const handleDoubleClick = () => {
    onDoubleClick(item);
  };

  return (
    <Button
      variant={isSelected ? "default" : "outline"}
      size="sm"
      className={cn(
        "w-full justify-start text-left h-auto p-3 mb-2 cursor-pointer transition-all",
        isSelected && "ring-2 ring-primary",
        item.checked && "opacity-50 line-through"
      )}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      draggable
      onDragStart={(e) => onDragStart(e, item)}
    >
      <div className="flex flex-col items-start w-full">
        <div className="font-medium text-sm">{item.name}</div>
        <div className="text-xs text-muted-foreground flex justify-between w-full">
          <span>{item.quantity}</span>
          {item.meal && <span>({item.meal})</span>}
        </div>
      </div>
    </Button>
  );
};
