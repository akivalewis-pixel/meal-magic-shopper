
import React, { useState } from "react";
import { GroceryItem, GroceryCategory } from "@/types";
import { StoreColumn } from "./StoreColumn";
import { IngredientEditDialog } from "./IngredientEditDialog";
import { MultiSelectActions } from "./MultiSelectActions";
import { useCustomCategories } from "./useCustomCategories";

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
  const { customCategories, addCustomCategory } = useCustomCategories();
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [editingItem, setEditingItem] = useState<GroceryItem | null>(null);
  const [draggedItem, setDraggedItem] = useState<GroceryItem | null>(null);
  
  const allItems = Object.values(groupedItems).flatMap(categories =>
    Object.values(categories).flat()
  );

  const selectedItemObjects = allItems.filter(item => selectedItems.includes(item.id));

  const handleSelectItem = (id: string, isMultiSelect: boolean) => {
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
    setEditingItem(item);
  };

  const handleSaveItem = (updatedItem: GroceryItem) => {
    onUpdateItem(updatedItem);
    setEditingItem(null);
  };

  const handleCategoryChange = (item: GroceryItem, category: string) => {
    const updatedItem: GroceryItem = {
      ...item,
      category: category as GroceryCategory,
      __updateTimestamp: Date.now()
    };
    
    onUpdateItem(updatedItem);
  };

  const handleDragStart = (e: React.DragEvent, item: GroceryItem) => {
    setDraggedItem(item);
    e.dataTransfer.setData("text/plain", item.id);
    e.dataTransfer.setData("application/json", JSON.stringify(item));
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDrop = (e: React.DragEvent, targetStore: string, targetCategory?: GroceryCategory) => {
    e.preventDefault();
    
    let itemToUpdate = draggedItem;
    
    if (!itemToUpdate) {
      const itemId = e.dataTransfer.getData("text/plain");
      if (itemId) {
        itemToUpdate = allItems.find(item => item.id === itemId) || null;
      }
    }
    
    if (!itemToUpdate) return;
    
    const updatedItem = { 
      ...itemToUpdate,
      store: targetStore,
      ...(targetCategory && { category: targetCategory }),
      __updateTimestamp: Date.now()
    };
    
    onUpdateItem(updatedItem);
    setDraggedItem(null);
  };

  const handleUpdateMultiple = (items: GroceryItem[], updates: Partial<GroceryItem>) => {
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
        {Object.entries(groupedItems).map(([storeName, categories]) => (
          <StoreColumn
            key={storeName}
            storeName={storeName}
            categories={categories}
            selectedItems={selectedItems}
            onSelectItem={handleSelectItem}
            onDoubleClickItem={handleDoubleClickItem}
            onDragStart={handleDragStart}
            onDragOver={(e) => {
              e.preventDefault();
              e.dataTransfer.dropEffect = "move";
            }}
            onDrop={handleDrop}
            customCategoryNames={customCategoryNames}
            customCategories={customCategories}
            onAddCustomCategory={addCustomCategory}
            onCategoryChange={handleCategoryChange}
          />
        ))}
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
