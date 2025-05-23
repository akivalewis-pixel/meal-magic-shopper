
import React, { useState } from "react";
import { GroceryItem } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Plus, Settings, RefreshCw, LayoutGrid, List } from "lucide-react";
import { SimpleListView } from "./SimpleListView";
import { SimpleBoardView } from "./SimpleBoardView";
import { useSimpleShoppingList } from "@/hooks/useShoppingList/useSimpleShoppingList";

interface NewShoppingListProps {
  meals: any[];
  pantryItems?: string[];
}

export const NewShoppingList = ({ meals, pantryItems = [] }: NewShoppingListProps) => {
  const [viewMode, setViewMode] = useState<"list" | "board">("list");
  const [groupByStore, setGroupByStore] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showChecked, setShowChecked] = useState(true);
  
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

  // Filter items based on search and checked status
  const filteredItems = groceryItems.filter(item => {
    const matchesSearch = searchTerm === "" || 
      item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const shouldShow = showChecked || !item.checked;
    return matchesSearch && shouldShow;
  });

  console.log("Filtered items:", filteredItems.map(i => ({ name: i.name, store: i.store })));

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
          
          <div className="flex items-center space-x-2">
            <Switch
              id="show-checked"
              checked={showChecked}
              onCheckedChange={setShowChecked}
            />
            <Label htmlFor="show-checked">Show completed</Label>
          </div>
          
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
              <p>No items in your shopping list</p>
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
      </div>
    </section>
  );
};
