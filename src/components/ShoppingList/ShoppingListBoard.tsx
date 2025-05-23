
import React, { useState } from "react";
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

  console.log("ShoppingListBoard - Grouped items structure:", groupedItems);
  console.log("ShoppingListBoard - All items count:", allItems.length);
  console.log("ShoppingListBoard - All items with stores:", allItems.map(item => ({ name: item.name, store: item.store || 'Unassigned' })));

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
    setDraggedItem(item);
    e.dataTransfer.effectAllowed = "move";
    // Store the complete item data for drop handling
    e.dataTransfer.setData("text/plain", JSON.stringify({
      id: item.id,
      name: item.name,
      currentStore: item.store || "Unassigned"
    }));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, targetStore: string, targetCategory?: GroceryCategory) => {
    e.preventDefault();
    
    if (!draggedItem) {
      console.log("Board - No dragged item found");
      return;
    }

    console.log("Board - Drop event:", {
      itemName: draggedItem.name,
      fromStore: draggedItem.store || "Unassigned", 
      toStore: targetStore,
      targetCategory
    });

    // Normalize the target store value
    const normalizedTargetStore = targetStore === "Unassigned" ? "Unassigned" : targetStore;
    
    const updates: Partial<GroceryItem> = {
      store: normalizedTargetStore
    };

    if (targetCategory) {
      updates.category = targetCategory;
    }

    console.log("Board - Applying updates to dragged item:", updates);
    
    // Create updated item and call update
    const updatedItem = { ...draggedItem, ...updates };
    onUpdateItem(updatedItem);
    
    setDraggedItem(null);
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

  // Generate a unique key based on all item stores to force re-render when stores change
  const boardKey = allItems.map(item => `${item.id}-${item.store || 'Unassigned'}`).join('|');

  return (
    <div className="space-y-4" key={boardKey}>
      <MultiSelectActions
        selectedItems={selectedItemObjects}
        onUpdateMultiple={handleUpdateMultiple}
        onClearSelection={() => setSelectedItems([])}
        availableStores={availableStores}
      />
      
      <div className="flex gap-4 overflow-x-auto pb-4">
        {Object.entries(groupedItems).map(([storeName, categories]) => {
          console.log("Board - Rendering store column:", storeName, "with categories:", Object.keys(categories));
          // Generate unique key for each store column based on its items
          const storeKey = `${storeName}-${Object.values(categories).flat().map(item => `${item.id}-${item.store}`).join('|')}`;
          return (
            <StoreColumn
              key={storeKey}
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
