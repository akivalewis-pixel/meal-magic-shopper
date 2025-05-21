
import React, { useState, useEffect } from "react";
import { GroceryItem, GroceryCategory } from "@/types";
import { Checkbox } from "@/components/ui/checkbox";
import { groceryCategories, departments } from "@/utils/constants";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, X, Edit, List, Store } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";

interface ShoppingListSectionProps {
  groceryItems: GroceryItem[];
  onToggleItem: (id: string) => void;
  onUpdateItem: (updatedItem: GroceryItem) => void;
  availableStores: string[];
  onUpdateStores?: (stores: string[]) => void;
}

// Helper functions declared before they're used to avoid initialization errors
const getCategoryLabel = (category: GroceryCategory): string => {
  return groceryCategories.find(c => c.value === category)?.label || "Other";
};

// Get category background color
const getCategoryColor = (category: GroceryCategory): string => {
  return `bg-grocery-${category}`;
};

export const ShoppingListSection = ({
  groceryItems,
  onToggleItem,
  onUpdateItem,
  availableStores = ["Any Store", "Supermarket", "Farmers Market", "Specialty Store"],
  onUpdateStores
}: ShoppingListSectionProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showChecked, setShowChecked] = useState(true);
  const [selectedStore, setSelectedStore] = useState<string>("all");
  const [groupByStore, setGroupByStore] = useState<boolean>(true);
  const [isEditingStores, setIsEditingStores] = useState(false);
  const [storeInput, setStoreInput] = useState("");
  const [editableStores, setEditableStores] = useState<string[]>([...availableStores]);
  const [sortBy, setSortBy] = useState<"store" | "department" | "category">("store");

  // Group items by store if groupByStore is true, otherwise by category
  const groupedItems = React.useMemo(() => {
    let filteredItems = groceryItems.filter(item => {
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
  }, [groceryItems, searchTerm, showChecked, selectedStore, groupByStore, sortBy]);

  const handleQuantityChange = (item: GroceryItem, newQuantity: string) => {
    onUpdateItem({ ...item, quantity: newQuantity });
  };

  const handleStoreChange = (item: GroceryItem, store: string) => {
    onUpdateItem({ ...item, store });
  };

  const handleDepartmentChange = (item: GroceryItem, department: string) => {
    onUpdateItem({ ...item, department });
  };
  
  const handleAddStore = () => {
    if (storeInput.trim() && !editableStores.includes(storeInput.trim())) {
      const updatedStores = [...editableStores, storeInput.trim()];
      setEditableStores(updatedStores);
      setStoreInput("");
    }
  };
  
  const handleRemoveStore = (store: string) => {
    const updatedStores = editableStores.filter(s => s !== store);
    setEditableStores(updatedStores);
  };
  
  const handleSaveStores = () => {
    if (onUpdateStores) {
      onUpdateStores(editableStores);
    }
    setIsEditingStores(false);
  };

  const handleSortChange = (value: "store" | "department" | "category") => {
    setSortBy(value);
  };

  return (
    <section id="shopping-list" className="py-8 bg-gray-50">
      <div className="container mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
          <h2 className="text-2xl font-bold text-carrot-dark mb-4 sm:mb-0">Shopping List</h2>
          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <List className="mr-2 h-4 w-4" />
                  Sort By: {sortBy === "store" ? "Store" : sortBy === "department" ? "Department" : "Category"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleSortChange("store")}>
                  <Store className="mr-2 h-4 w-4" /> Store
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSortChange("department")}>
                  <List className="mr-2 h-4 w-4" /> Department
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSortChange("category")}>
                  <List className="mr-2 h-4 w-4" /> Category
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Button 
              variant="outline" 
              onClick={() => setIsEditingStores(true)}
            >
              <Edit className="mr-2 h-4 w-4" />
              Customize Stores
            </Button>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <Label htmlFor="search-items">Search Items</Label>
            <Input
              id="search-items"
              type="text"
              placeholder="Search ingredients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <div>
              <Label htmlFor="store-filter">Store Filter</Label>
              <Select
                value={selectedStore}
                onValueChange={setSelectedStore}
              >
                <SelectTrigger id="store-filter" className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filter by store" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Stores</SelectItem>
                  {availableStores.map(store => (
                    <SelectItem key={store} value={store}>{store}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button 
                variant="outline" 
                onClick={() => setShowChecked(!showChecked)}
                className="whitespace-nowrap"
              >
                {showChecked ? "Hide Checked Items" : "Show Checked Items"}
              </Button>
            </div>
            <div className="flex items-end">
              <Button 
                variant="outline" 
                onClick={() => setGroupByStore(!groupByStore)}
                className="whitespace-nowrap"
              >
                {groupByStore ? "Group by Category" : "Group by Store"}
              </Button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          {Object.keys(groupedItems).length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              <p>No items in your shopping list</p>
              {searchTerm && <p className="text-sm mt-2">Try a different search term</p>}
            </div>
          ) : (
            Object.entries(groupedItems).map(([storeName, categories]) => (
              <div key={storeName} className="mb-8 last:mb-0">
                {groupByStore && (
                  <h3 className="text-lg font-semibold mb-4 pb-1 border-b">{storeName}</h3>
                )}
                
                {Object.entries(categories).map(([categoryName, items]) => (
                  <div key={`${storeName}-${categoryName}`} className="mb-6 last:mb-0">
                    <h4 className="font-medium mb-2">{categoryName}</h4>
                    <ul className="space-y-3">
                      {items.map((item) => (
                        <li key={item.id} className="flex items-center gap-3 flex-wrap">
                          <Checkbox
                            id={item.id}
                            checked={item.checked}
                            onCheckedChange={() => onToggleItem(item.id)}
                          />
                          <Label
                            htmlFor={item.id}
                            className={`flex flex-1 justify-between items-center ${
                              item.checked ? "line-through text-gray-400" : ""
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <span>{item.name}</span>
                              {item.meal && (
                                <span className="text-xs text-gray-500">({item.meal})</span>
                              )}
                            </div>
                          </Label>
                          
                          <div className="flex items-center gap-2 ml-auto sm:ml-0">
                            <Input
                              className="w-[80px] h-8 text-sm"
                              value={item.quantity}
                              onChange={(e) => handleQuantityChange(item, e.target.value)}
                              onClick={(e) => e.stopPropagation()}
                            />
                            
                            <Select 
                              value={item.store || ""}
                              onValueChange={(value) => handleStoreChange(item, value)}
                            >
                              <SelectTrigger className="w-[120px] h-8 text-xs">
                                <SelectValue placeholder="Select Store" />
                              </SelectTrigger>
                              <SelectContent>
                                {availableStores.map(store => (
                                  <SelectItem key={store} value={store}>{store}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Edit Stores Dialog */}
      <Dialog open={isEditingStores} onOpenChange={setIsEditingStores}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Customize Store Names</DialogTitle>
            <DialogDescription>
              Add, edit or remove stores to organize your shopping list.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="flex items-end gap-2 mb-4">
              <div className="flex-1">
                <Label htmlFor="new-store">Add New Store</Label>
                <Input 
                  id="new-store" 
                  value={storeInput}
                  onChange={(e) => setStoreInput(e.target.value)}
                  placeholder="Enter store name"
                  onKeyDown={(e) => e.key === "Enter" && handleAddStore()}
                />
              </div>
              <Button onClick={handleAddStore}>
                <Plus className="h-4 w-4 mr-1" /> Add
              </Button>
            </div>
            
            <div className="space-y-2">
              <Label>Current Stores</Label>
              {editableStores.map(store => (
                <div key={store} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                  <span>{store}</span>
                  <Button variant="ghost" size="sm" onClick={() => handleRemoveStore(store)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              {editableStores.length === 0 && (
                <p className="text-sm text-gray-500 py-2">No stores added yet</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditingStores(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveStores}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
};
