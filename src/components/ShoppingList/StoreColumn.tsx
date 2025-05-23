
import React from "react";
import { GroceryItem, GroceryCategory } from "@/types";
import { IngredientButton } from "./IngredientButton";
import { cn } from "@/lib/utils";

interface StoreColumnProps {
  storeName: string;
  categories: Record<string, GroceryItem[]>;
  selectedItems: string[];
  onSelectItem: (id: string, isMultiSelect: boolean) => void;
  onDoubleClickItem: (item: GroceryItem) => void;
  onDragStart: (e: React.DragEvent, item: GroceryItem) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, targetStore: string, targetCategory?: GroceryCategory) => void;
  customCategoryNames: Record<string, string>;
}

export const StoreColumn = ({
  storeName,
  categories,
  selectedItems,
  onSelectItem,
  onDoubleClickItem,
  onDragStart,
  onDragOver,
  onDrop,
  customCategoryNames
}: StoreColumnProps) => {
  const getDisplayCategoryName = (categoryName: string): string => {
    return customCategoryNames[categoryName] || categoryName;
  };

  console.log("StoreColumn - Rendering:", storeName, "Categories:", Object.keys(categories));
  Object.entries(categories).forEach(([category, items]) => {
    console.log(`StoreColumn - Category '${category}' contains ${items.length} items:`, 
      items.map(item => item.name));
  });

  return (
    <div className="flex-1 min-w-[280px]">
      <div 
        className="bg-white rounded-lg shadow-sm border p-4 h-full"
        onDragOver={onDragOver}
        onDrop={(e) => onDrop(e, storeName)}
      >
        <h3 className="text-lg font-semibold mb-4 sticky top-0 bg-white pb-2 border-b">
          {storeName}
        </h3>
        
        <div className="space-y-4">
          {Object.entries(categories).map(([categoryName, items]) => {
            console.log(`Rendering category: ${categoryName} with ${items.length} items`);
            
            return (
              <div key={categoryName} className="mb-4">
                <h4 className="text-sm font-medium text-muted-foreground mb-2">
                  {getDisplayCategoryName(categoryName)}
                </h4>
                <div 
                  className={cn(
                    "min-h-[60px] p-2 rounded border-2 border-dashed border-muted transition-colors",
                    "hover:border-primary/50"
                  )}
                  onDragOver={onDragOver}
                  onDrop={(e) => onDrop(e, storeName, categoryName as GroceryCategory)}
                >
                  {items.length > 0 ? (
                    <div className="space-y-2">
                      {items.map(item => (
                        <IngredientButton
                          key={item.id}
                          item={item}
                          isSelected={selectedItems.includes(item.id)}
                          onSelect={onSelectItem}
                          onDoubleClick={onDoubleClickItem}
                          onDragStart={onDragStart}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground text-sm py-4">
                      Drop items here
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
