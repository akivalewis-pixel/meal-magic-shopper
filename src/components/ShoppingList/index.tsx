
import React, { useState } from "react";
import { GroceryItem } from "@/types";
import { ShoppingListActions } from "./ShoppingListActions";
import { ShoppingListContent } from "./ShoppingListContent";
import { useShoppingListGrouping } from "./useShoppingListGrouping";
import { useCategoryNames } from "./useCategoryNames";
import { Button } from "@/components/ui/button";
import { LayoutGrid, List } from "lucide-react";

interface ShoppingListSectionProps {
  groceryItems: GroceryItem[];
  onToggleItem: (id: string) => void;
  onUpdateItem: (updatedItem: GroceryItem) => void;
  onUpdateMultipleItems?: (items: GroceryItem[], updates: Partial<GroceryItem>) => void;
  onAddItem?: (item: GroceryItem) => void;
  onArchiveItem?: (id: string) => void;
  availableStores: string[];
  onUpdateStores?: (stores: string[]) => void;
  archivedItems?: GroceryItem[];
}

export const ShoppingListSection = ({
  groceryItems,
  onToggleItem,
  onUpdateItem,
  onUpdateMultipleItems,
  onAddItem,
  onArchiveItem,
  availableStores = ["Any Store", "Supermarket", "Farmers Market", "Specialty Store"],
  onUpdateStores,
  archivedItems = []
}: ShoppingListSectionProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showChecked, setShowChecked] = useState(true);
  const [selectedStore, setSelectedStore] = useState<string>("all");
  const [groupByStore, setGroupByStore] = useState<boolean>(true);
  const [isEditingStores, setIsEditingStores] = useState(false);
  const [sortBy, setSortBy] = useState<"store" | "department" | "category">("store");
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [searchArchivedItems, setSearchArchivedItems] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "board">("list");
  
  const { customCategoryNames, handleCategoryNameChange } = useCategoryNames();

  const handleToggle = (id: string) => {
    if (onArchiveItem) {
      onArchiveItem(id);
    } else {
      onToggleItem(id);
    }
  };

  const handleQuantityChange = (item: GroceryItem, newQuantity: string) => {
    onUpdateItem({ ...item, quantity: newQuantity });
  };

  const handleStoreChange = (item: GroceryItem, store: string) => {
    console.log("Store changed for", item.name, "to", store);
    onUpdateItem({ ...item, store });
  };
  
  const handleSaveStores = (updatedStores: string[]) => {
    if (onUpdateStores) {
      onUpdateStores(updatedStores);
    }
  };
  
  const handleNameChange = (item: GroceryItem, name: string) => {
    onUpdateItem({ ...item, name });
  };

  const handleUpdateMultiple = (items: GroceryItem[], updates: Partial<GroceryItem>) => {
    if (onUpdateMultipleItems) {
      onUpdateMultipleItems(items, updates);
    } else {
      // Fallback to individual updates if bulk update not available
      items.forEach(item => {
        onUpdateItem({ ...item, ...updates });
      });
    }
  };

  const groupedItems = useShoppingListGrouping(
    groceryItems,
    archivedItems,
    searchArchivedItems,
    searchTerm,
    showChecked,
    selectedStore,
    groupByStore,
    sortBy
  );

  return (
    <section id="shopping-list" className="py-8 bg-gray-50">
      <div className="container mx-auto">
        <div className="flex items-center justify-between mb-4">
          <ShoppingListActions
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            showChecked={showChecked}
            setShowChecked={setShowChecked}
            selectedStore={selectedStore}
            setSelectedStore={setSelectedStore}
            groupByStore={groupByStore}
            setGroupByStore={setGroupByStore}
            sortBy={sortBy}
            setSortBy={setSortBy}
            setIsEditingStores={setIsEditingStores}
            availableStores={availableStores}
            setIsAddingItem={setIsAddingItem}
            canAddItem={!!onAddItem}
          />
          
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("list")}
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "board" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("board")}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <ShoppingListContent
          groupedItems={groupedItems}
          onToggle={handleToggle}
          onQuantityChange={handleQuantityChange}
          onStoreChange={handleStoreChange}
          onNameChange={handleNameChange}
          onCategoryNameChange={handleCategoryNameChange}
          onUpdateItem={onUpdateItem}
          onUpdateMultiple={handleUpdateMultiple}
          availableStores={availableStores}
          groupByStore={groupByStore}
          searchArchivedItems={searchArchivedItems}
          customCategoryNames={customCategoryNames}
          isEditingStores={isEditingStores}
          setIsEditingStores={setIsEditingStores}
          onSaveStores={handleSaveStores}
          isAddingItem={isAddingItem}
          setIsAddingItem={setIsAddingItem}
          onAddItem={onAddItem}
          archivedItems={archivedItems}
          setSearchArchivedItems={setSearchArchivedItems}
          searchTerm={searchTerm}
          viewMode={viewMode}
        />
      </div>
    </section>
  );
};
