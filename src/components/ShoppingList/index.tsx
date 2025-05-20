
import React, { useState, useEffect } from "react";
import { GroceryItem, GroceryCategory } from "@/types";
import { groceryCategories } from "@/utils/constants";
import { ShoppingListHeader } from "./ShoppingListHeader";
import { ShoppingListFilters } from "./ShoppingListFilters";
import { ShoppingListGroup } from "./ShoppingListGroup";
import { StoreManagementDialog } from "./StoreManagementDialog";
import { AddItemForm } from "./AddItemForm";

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

// Helper functions
const getCategoryLabel = (category: GroceryCategory): string => {
  return groceryCategories.find(c => c.value === category)?.label || "Other";
};

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

  // Handle the toggle to immediately archive checked items
  const handleToggle = (id: string) => {
    if (onArchiveItem) {
      onArchiveItem(id);
    } else {
      onToggleItem(id);
    }
  };

  // Group items by store if groupByStore is true, otherwise by category
  const groupedItems = React.useMemo(() => {
    // Select which items array to use based on search mode
    const itemsToProcess = searchArchivedItems ? archivedItems : groceryItems;
    
    let filteredItems = itemsToProcess.filter(item => {
      const matchesSearch = searchTerm === "" || 
        item.name.toLowerCase().includes(searchTerm.toLowerCase());
      const shouldShow = showChecked || !item.checked;
      const matchesStore = selectedStore === "all" || 
        item.store === selectedStore || !item.store;
        
      return matchesSearch && shouldShow && matchesStore;
    });

    if (groupByStore) {
      // Group by store, then by department/category
      const byStore: Record<string, Record<string, GroceryItem[]>> = {};
      
      filteredItems.forEach(item => {
        const store = item.store || "Unassigned";
        let secondaryKey;
        
        if (sortBy === "department") {
          secondaryKey = item.department || "Unassigned";
        } else {
          secondaryKey = getCategoryLabel(item.category);
        }
        
        if (!byStore[store]) {
          byStore[store] = {};
        }
        
        if (!byStore[store][secondaryKey]) {
          byStore[store][secondaryKey] = [];
        }
        
        byStore[store][secondaryKey].push(item);
      });
      
      return byStore;
    } else {
      // Group by category or department
      const byPrimary: Record<string, GroceryItem[]> = {};
      
      filteredItems.forEach(item => {
        let primaryKey;
        
        if (sortBy === "department") {
          primaryKey = item.department || "Unassigned";
        } else {
          primaryKey = getCategoryLabel(item.category);
        }
        
        if (!byPrimary[primaryKey]) {
          byPrimary[primaryKey] = [];
        }
        
        byPrimary[primaryKey].push(item);
      });
      
      return { "All Stores": byPrimary };
    }
  }, [groceryItems, searchTerm, showChecked, selectedStore, groupByStore, sortBy, archivedItems, searchArchivedItems]);

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

  return (
    <section id="shopping-list" className="py-8 bg-gray-50">
      <div className="container mx-auto">
        <ShoppingListHeader 
          onEditStores={() => setIsEditingStores(true)} 
          onSortChange={setSortBy}
          sortBy={sortBy}
          onAddItem={() => {
            setSearchArchivedItems(false);
            setIsAddingItem(true);
          }}
          canAddItem={!!onAddItem}
        />
        
        <ShoppingListFilters 
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          selectedStore={selectedStore}
          onStoreFilterChange={setSelectedStore}
          showChecked={showChecked}
          onToggleShowChecked={() => setShowChecked(!showChecked)}
          groupByStore={groupByStore}
          onToggleGroupByStore={() => setGroupByStore(!groupByStore)}
          availableStores={availableStores}
        />

        <div className="bg-white rounded-lg shadow p-4">
          {Object.keys(groupedItems).length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              <p>No items in your {searchArchivedItems ? "archive" : "shopping list"}</p>
              {searchTerm && <p className="text-sm mt-2">Try a different search term</p>}
            </div>
          ) : (
            Object.entries(groupedItems).map(([storeName, categories]) => (
              <div key={storeName} className="mb-8 last:mb-0">
                {groupByStore && (
                  <h3 className="text-lg font-semibold mb-4 pb-1 border-b">{storeName}</h3>
                )}
                
                {Object.entries(categories).map(([categoryName, items]) => (
                  <ShoppingListGroup 
                    key={`${storeName}-${categoryName}`}
                    categoryName={categoryName}
                    items={items}
                    onToggle={handleToggle}
                    onQuantityChange={handleQuantityChange}
                    onStoreChange={handleStoreChange}
                    onToggleRecurring={handleToggleRecurring}
                    onNameChange={handleNameChange}
                    availableStores={availableStores}
                    isArchiveView={searchArchivedItems}
                  />
                ))}
              </div>
            ))
          )}
        </div>
      </div>

      <StoreManagementDialog 
        open={isEditingStores} 
        onOpenChange={setIsEditingStores}
        stores={availableStores}
        onSaveStores={handleSaveStores}
      />
      
      {onAddItem && (
        <AddItemForm
          open={isAddingItem}
          onOpenChange={setIsAddingItem}
          availableStores={availableStores}
          onAddItem={onAddItem}
          archivedItems={archivedItems}
          onSearchArchivedItems={setSearchArchivedItems}
          isSearchingArchived={searchArchivedItems}
        />
      )}
    </section>
  );
};
