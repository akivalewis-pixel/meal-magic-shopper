import React, { useState } from "react";
import { GroceryItem } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Plus, Settings, RefreshCw, LayoutGrid, List, Store, Edit } from "lucide-react";
import { SimpleListView } from "./SimpleListView";
import { SimpleBoardView } from "./SimpleBoardView";
import { useSimpleShoppingList } from "@/hooks/useShoppingList/useSimpleShoppingList";
import { StoreManagementDialog } from "./StoreManagementDialog";
import { AddItemForm } from "./AddItemForm";

interface NewShoppingListProps {
  meals: any[];
  pantryItems?: string[];
}

export const NewShoppingList = ({ meals, pantryItems = [] }: NewShoppingListProps) => {
  const [viewMode, setViewMode] = useState<"list" | "board">("list");
  const [groupByStore, setGroupByStore] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStore, setSelectedStore] = useState<string>("all");
  const [isEditingStores, setIsEditingStores] = useState(false);
  const [isAddingItem, setIsAddingItem] = useState(false);
  
  const {
    groceryItems,
    archivedItems,
    availableStores,
    updateItem,
    toggleItem,
    archiveItem,
    addItem,
    updateStores,
    resetList
  } = useSimpleShoppingList(meals, pantryItems);

  // Filter items based on search and store selection
  const filteredItems = groceryItems.filter(item => {
    const matchesSearch = searchTerm === "" || 
      item.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStore = selectedStore === "all" || 
      (selectedStore === "Unassigned" ? (!item.store || item.store === "Unassigned") : item.store === selectedStore);
    
    return matchesSearch && matchesStore;
  });

  const handleAddNewItem = (newItem: GroceryItem) => {
    addItem(newItem);
    setIsAddingItem(false);
  };

  const handleSaveStores = (stores: string[]) => {
    updateStores(stores);
    setIsEditingStores(false);
  };

  console.log("NewShoppingList - Selected store:", selectedStore);
  console.log("NewShoppingList - Filtered items:", filteredItems.length);
  console.log("NewShoppingList - Available stores:", availableStores);

  return (
    <section className="py-8 bg-gray-50">
      <div className="container mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Shopping List</h2>
          
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
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditingStores(true)}
              className="flex items-center gap-2"
            >
              <Store className="h-4 w-4" />
              Manage Stores
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAddingItem(true)}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Item
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={resetList}
              className="text-red-600"
            >
              <RefreshCw className="h-4 w-4" />
              Reset
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 mb-6">
          <Input
            placeholder="Search items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-xs"
          />
          
          <Select value={selectedStore} onValueChange={setSelectedStore}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by store" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Stores</SelectItem>
              <SelectItem value="Unassigned">Unassigned</SelectItem>
              {availableStores
                .filter(store => store !== "Unassigned")
                .map(store => (
                  <SelectItem key={store} value={store}>
                    {store}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
          
          {viewMode === "list" && (
            <div className="flex items-center space-x-2">
              <Switch
                id="group-by-store"
                checked={groupByStore}
                onCheckedChange={setGroupByStore}
              />
              <Label htmlFor="group-by-store">Group by store</Label>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          {filteredItems.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              <p>
                {searchTerm || selectedStore !== "all" 
                  ? "No items match your filters"
                  : "No items in your shopping list"
                }
              </p>
              {(searchTerm || selectedStore !== "all") && (
                <p className="text-sm mt-2">Try adjusting your search or store filter</p>
              )}
            </div>
          ) : viewMode === "board" ? (
            <SimpleBoardView
              items={filteredItems}
              availableStores={availableStores}
              onUpdateItem={updateItem}
            />
          ) : (
            <SimpleListView
              items={filteredItems}
              availableStores={availableStores}
              onUpdateItem={updateItem}
              onToggleItem={toggleItem}
              groupByStore={groupByStore}
            />
          )}
        </div>

        <StoreManagementDialog 
          open={isEditingStores} 
          onOpenChange={setIsEditingStores}
          stores={availableStores}
          onSaveStores={handleSaveStores}
        />
        
        <AddItemForm
          open={isAddingItem}
          onOpenChange={setIsAddingItem}
          availableStores={availableStores}
          onAddItem={handleAddNewItem}
          archivedItems={archivedItems}
          onSearchArchivedItems={() => {}}
          isSearchingArchived={false}
        />
      </div>
    </section>
  );
};
