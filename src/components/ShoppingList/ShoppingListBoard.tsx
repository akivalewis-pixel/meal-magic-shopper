
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
  
  // Calculate a hash of the groupedItems to detect changes
  const itemsHash = useCallback(() => {
    return Object.entries(groupedItems)
      .map(([store, categories]) => {
        const categoryHashes = Object.entries(categories)
          .map(([category, items]) => {
            return `${category}:${items.map(i => `${i.id}-${i.store || 'Unassigned'}`).join('|')}`;
          })
          .join('||');
        return `${store}-${categoryHashes}`;
      })
      .join('###');
  }, [groupedItems]);
  
  // Update this hash whenever the groupedItems change
  const [currentItemsHash, setCurrentItemsHash] = useState(itemsHash());
  const [boardKey, setBoardKey] = useState(Date.now());
  
  // Force re-render when grouped items structure changes
  useEffect(() => {
    const newHash = itemsHash();
    if (newHash !== currentItemsHash) {
      console.log("Board - Data structure changed, forcing re-render");
      setCurrentItemsHash(newHash);
      setBoardKey(Date.now());
    }
  }, [groupedItems, itemsHash, currentItemsHash]);

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
    
    // Force UI refresh
    setBoardKey(Date.now());
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
    
    // Force re-render
    setBoardKey(Date.now());
  };

  const handleUpdateMultiple = (items: GroceryItem[], updates: Partial<GroceryItem>) => {
    console.log("Board - Updating multiple items:", items.length, "updates:", updates);
    onUpdateMultiple(items, updates);
    setSelectedItems([]);
    
    // Force re-render
    setBoardKey(Date.now());
  };

  if (Object.keys(groupedItems).length === 0) {
    return (
      <div className="text-center py-10 text-gray-500">
        <p>No items in your shopping list</p>
      </div>
    );
  }

  return (
    <div className="space-y-4" key={`board-${boardKey}`}>
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
              key={`${storeName}-${boardKey}-${Object.keys(categories).length}`}
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
