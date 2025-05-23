
import React, { useState } from "react";
import { GroceryItem, GroceryCategory } from "@/types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SimpleBoardViewProps {
  items: GroceryItem[];
  availableStores: string[];
  onUpdateItem: (item: GroceryItem) => void;
}

export const SimpleBoardView = ({
  items,
  availableStores,
  onUpdateItem
}: SimpleBoardViewProps) => {
  const [draggedItem, setDraggedItem] = useState<GroceryItem | null>(null);

  // Group items by store
  const groupedItems = items.reduce((acc, item) => {
    const store = item.store || "Unassigned";
    if (!acc[store]) acc[store] = {};
    
    const category = item.category;
    if (!acc[store][category]) acc[store][category] = [];
    
    acc[store][category].push(item);
    return acc;
  }, {} as Record<string, Record<string, GroceryItem[]>>);

  const handleDragStart = (e: React.DragEvent, item: GroceryItem) => {
    console.log("Drag start:", item.name);
    setDraggedItem(item);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, targetStore: string) => {
    e.preventDefault();
    console.log("Drop on store:", targetStore);
    
    if (draggedItem && draggedItem.store !== targetStore) {
      console.log("Moving", draggedItem.name, "from", draggedItem.store, "to", targetStore);
      onUpdateItem({ ...draggedItem, store: targetStore });
    }
    
    setDraggedItem(null);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
  };

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {availableStores.map(storeName => {
        const storeItems = groupedItems[storeName] || {};
        
        return (
          <div key={storeName} className="flex-1 min-w-[280px]">
            <div 
              className="bg-white rounded-lg shadow-sm border p-4 h-full min-h-[400px]"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, storeName)}
            >
              <h3 className="text-lg font-semibold mb-4 sticky top-0 bg-white pb-2 border-b">
                {storeName}
              </h3>
              
              <div className="space-y-4">
                {Object.keys(storeItems).length === 0 ? (
                  <div className="text-center text-muted-foreground text-sm py-8 border-2 border-dashed border-muted rounded">
                    Drop items here
                  </div>
                ) : (
                  Object.entries(storeItems).map(([category, categoryItems]) => (
                    <div key={category} className="mb-4">
                      <h4 className="text-sm font-medium text-muted-foreground mb-2 capitalize">
                        {category}
                      </h4>
                      <div className="space-y-2">
                        {categoryItems.map(item => (
                          <Button
                            key={item.id}
                            variant="outline"
                            size="sm"
                            className={cn(
                              "w-full justify-start text-left h-auto p-3 cursor-move",
                              item.checked && "opacity-50 line-through",
                              draggedItem?.id === item.id && "opacity-50"
                            )}
                            draggable={true}
                            onDragStart={(e) => handleDragStart(e, item)}
                            onDragEnd={handleDragEnd}
                          >
                            <div className="flex flex-col items-start w-full">
                              <div className="font-medium text-sm">{item.name}</div>
                              <div className="text-xs text-muted-foreground flex justify-between w-full">
                                <span>{item.quantity}</span>
                                {item.meal && <span>({item.meal})</span>}
                              </div>
                            </div>
                          </Button>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
