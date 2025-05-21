
import React, { useState } from "react";
import { GroceryItem } from "@/types";
import { ShoppingListActions } from "./ShoppingListActions";
import { ShoppingListContent } from "./ShoppingListContent";
import { useShoppingListGrouping } from "./useShoppingListGrouping";
import { useCategoryNames } from "./useCategoryNames";

interface ShoppingListSectionProps {
  groceryItems: GroceryItem[];
  onToggleItem: (id: string) => void;
  onUpdateItem: (updatedItem: GroceryItem) => void;
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
  
  const { customCategoryNames, handleCategoryNameChange } = useCategoryNames();

  // Handle the toggle to immediately archive checked items
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
    onUpdateItem({ ...item, store });
  };

  const handleToggleRecurring = (item: GroceryItem) => {
    onUpdateItem({ ...item, recurring: !item.recurring });
  };
  
  const handleSaveStores = (updatedStores: string[]) => {
    if (onUpdateStores) {
      onUpdateStores(updatedStores);
    }
  };
  
  const handleNameChange = (item: GroceryItem, name: string) => {
    onUpdateItem({ ...item, name });
  };

  // Use our custom hook to get the grouped items
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

        <ShoppingListContent
          groupedItems={groupedItems}
          onToggle={handleToggle}
          onQuantityChange={handleQuantityChange}
          onStoreChange={handleStoreChange}
          onToggleRecurring={handleToggleRecurring}
          onNameChange={handleNameChange}
          onCategoryNameChange={handleCategoryNameChange}
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
        />
      </div>
    </section>
  );
};
