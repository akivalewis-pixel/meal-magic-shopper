
import React, { useState } from "react";
import { GroceryItem } from "@/types";
import { ShoppingListActions } from "./ShoppingListActions";
import { ShoppingListContent } from "./ShoppingListContent";
import { useCategoryNames } from "./useCategoryNames";

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
  onResetList?: () => void;
}

export const ShoppingListSection = ({
  groceryItems,
  onToggleItem,
  onUpdateItem,
  onAddItem,
  onArchiveItem,
  availableStores = ["Any Store", "Supermarket", "Farmers Market", "Specialty Store"],
  onUpdateStores,
  archivedItems = [],
  onResetList
}: ShoppingListSectionProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showChecked, setShowChecked] = useState(true);
  const [selectedStore, setSelectedStore] = useState<string>("all");
  const [groupByStore, setGroupByStore] = useState<boolean>(true);
  const [isEditingStores, setIsEditingStores] = useState(false);
  const [sortBy, setSortBy] = useState<"store" | "department" | "category">("store");
  const [isAddingItem, setIsAddingItem] = useState(false);

  const handleToggle = (id: string) => {
    if (onArchiveItem) {
      onArchiveItem(id);
    } else {
      onToggleItem(id);
    }
  };

  const handleSaveStores = (updatedStores: string[]) => {
    if (onUpdateStores) {
      onUpdateStores(updatedStores);
    }
  };

  // Filter items
  const filteredItems = groceryItems.filter(item => {
    if (item.checked && !showChecked) return false;
    
    const matchesSearch = searchTerm === "" || 
      item.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStore = selectedStore === "all" || 
      (selectedStore === "Unassigned" ? (!item.store || item.store === "Unassigned") : item.store === selectedStore);
    
    return matchesSearch && matchesStore;
  });

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
            onResetList={onResetList}
          />
        </div>

        <ShoppingListContent
          filteredItems={filteredItems}
          searchTerm={searchTerm}
          selectedStore={selectedStore}
          viewMode="list"
          groupByStore={groupByStore}
          availableStores={availableStores}
          onUpdateItem={onUpdateItem}
          onRemoveItem={handleToggle}
        />
      </div>
    </section>
  );
};
