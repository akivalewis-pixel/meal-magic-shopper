import React, { useState, useEffect, useCallback } from "react";
import { GroceryItem, GroceryCategory } from "@/types";
import { StoreColumn } from "./StoreColumn";
import { IngredientEditDialog } from "./IngredientEditDialog";
import { MultiSelectActions } from "./MultiSelectActions";

interface ShoppingListBoardProps {
  groupedItems: Record<string, Record<string, GroceryItem[]>>;
  onUpdateItem: (updatedItem: GroceryItem) => void;
  onUpdateMultiple: (items: GroceryItem[], updates: Partial<GroceryItem>) => void;
  availableStores: string[];
  customCategoryNames: Record<string, string>;
}

export const ShoppingListBoard = ({
  groupedItems,
  onUpdateItem,
  onUpdateMultiple,
  availableStores,
  customCategoryNames
}: ShoppingListBoardProps) => {
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [editingItem, setEditingItem] = useState<GroceryItem | null>(null);
  const [draggedItem, setDraggedItem] = useState<GroceryItem | null>(null);
  
  // Get all items for selection handling
  const allItems = Object.values(groupedItems).flatMap(categories =>
    Object.values(categories).flat()
  );

  const selectedItemObjects = allItems.filter(item => selectedItems.includes(item.id));

  const handleSelectItem = (id: string, isMultiSelect: boolean) => {
    console.log("Selecting item:", id, "Multi-select:", isMultiSelect);
    if (isMultiSelect) {
      setSelectedItems(prev => 
        prev.includes(id) 
          ? prev.filter(itemId => itemId !== id)
          : [...prev, id]
      );
    } else {
      setSelectedItems([id]);
    }
  };

  const handleDoubleClickItem = (item: GroceryItem) => {
    console.log("Double-clicking item:", item.name);
    setEditingItem(item);
  };

  const handleSaveItem = (updatedItem: GroceryItem) => {
    console.log("Saving item from dialog:", updatedItem.name, "with store:", updatedItem.store);
    onUpdateItem(updatedItem);
    setEditingItem(null);
  };

  const handleDragStart = (e: React.DragEvent, item: GroceryItem) => {
    console.log("Board - Drag start:", item.name, "from store:", item.store || "Unassigned");
    
    // Store item data in multiple formats for compatibility
    e.dataTransfer.setData("text/plain", item.id);
    e.dataTransfer.setData("application/json", JSON.stringify(item));
    e.dataTransfer.effectAllowed = "move";
    
    // Keep reference in state
    setDraggedItem(item);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, targetStore: string, targetCategory?: GroceryCategory) => {
    e.preventDefault();
    console.log("Board - Drop event triggered for store:", targetStore, "category:", targetCategory);
    
    try {
      // Get the item from state or data transfer
      let itemToUpdate = draggedItem;
      
      if (!itemToUpdate) {
        const itemId = e.dataTransfer.getData("text/plain");
        const jsonData = e.dataTransfer.getData("application/json");
        
        if (jsonData) {
          try {
            itemToUpdate = JSON.parse(jsonData);
          } catch (err) {
            console.error("Failed to parse dragged item data:", err);
          }
        }
        
        if (!itemToUpdate && itemId) {
          itemToUpdate = allItems.find(item => item.id === itemId);
        }
      }
      
      if (!itemToUpdate) {
        console.error("No dragged item found");
        return;
      }
      
      console.log("Board - Found item to update:", itemToUpdate.name, "current store:", itemToUpdate.store);
      
      // Create updated item with new store/category
      const updatedItem = { 
        ...itemToUpdate,
        store: targetStore,
        ...(targetCategory && { category: targetCategory }),
        __updateTimestamp: Date.now()
      };
      
      console.log("Board - Applying update to item:", updatedItem.name, "new store:", updatedItem.store);
      
      // Call the update handler
      onUpdateItem(updatedItem);
      
    } catch (error) {
      console.error("Error in drop handler:", error);
    } finally {
      setDraggedItem(null);
    }
  };

  const handleUpdateMultiple = (items: GroceryItem[], updates: Partial<GroceryItem>) => {
    console.log("Board - Updating multiple items:", items.length, "updates:", updates);
    onUpdateMultiple(items, updates);
    setSelectedItems([]);
  };

  if (Object.keys(groupedItems).length === 0) {
    return (
      <div className="text-center py-10 text-gray-500">
        <p>No items in your shopping list</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <MultiSelectActions
        selectedItems={selectedItemObjects}
        onUpdateMultiple={handleUpdateMultiple}
        onClearSelection={() => setSelectedItems([])}
        availableStores={availableStores}
      />
      
      <div className="flex gap-4 overflow-x-auto pb-4">
        {Object.entries(groupedItems).map(([storeName, categories]) => {
          console.log("Board - Rendering store column:", storeName, "with categories:", Object.keys(categories));
          return (
            <StoreColumn
              key={`${storeName}-${Date.now()}`}
              storeName={storeName}
              categories={categories}
              selectedItems={selectedItems}
              onSelectItem={handleSelectItem}
              onDoubleClickItem={handleDoubleClickItem}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              customCategoryNames={customCategoryNames}
            />
          );
        })}
      </div>

      <IngredientEditDialog
        item={editingItem}
        open={!!editingItem}
        onOpenChange={(open) => !open && setEditingItem(null)}
        onSave={handleSaveItem}
        availableStores={availableStores}
      />
    </div>
  );
};
