
import React, { useState, useEffect } from "react";
import { GroceryItem, GroceryCategory } from "@/types";
import { Checkbox } from "@/components/ui/checkbox";
import { groceryCategories } from "@/utils/mealPlannerUtils";
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
import { Repeat } from "lucide-react";

interface ShoppingListSectionProps {
  groceryItems: GroceryItem[];
  onToggleItem: (id: string) => void;
  onUpdateItem: (updatedItem: GroceryItem) => void;
  availableStores: string[];
}

export const ShoppingListSection = ({
  groceryItems,
  onToggleItem,
  onUpdateItem,
  availableStores = ["Any Store", "Supermarket", "Farmers Market", "Specialty Store"],
}: ShoppingListSectionProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showChecked, setShowChecked] = useState(true);
  const [selectedStore, setSelectedStore] = useState<string>("all");
  const [groupByStore, setGroupByStore] = useState<boolean>(true);

  // Get category label - MOVED THIS FUNCTION BEFORE IT'S USED
  const getCategoryLabel = (category: GroceryCategory): string => {
    return groceryCategories.find(c => c.value === category)?.label || "Other";
  };

  // Get category background color
  const getCategoryColor = (category: GroceryCategory): string => {
    return `bg-grocery-${category}`;
  };

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
        const category = item.department || getCategoryLabel(item.category);
        
        if (!byStore[store]) {
          byStore[store] = {};
        }
        
        if (!byStore[store][category]) {
          byStore[store][category] = [];
        }
        
        byStore[store][category].push(item);
      });
      
      return byStore;
    } else {
      // Group by category only
      const byCategory: Record<string, GroceryItem[]> = {};
      
      filteredItems.forEach(item => {
        const category = getCategoryLabel(item.category);
        
        if (!byCategory[category]) {
          byCategory[category] = [];
        }
        
        byCategory[category].push(item);
      });
      
      return { "All Stores": byCategory };
    }
  }, [groceryItems, searchTerm, showChecked, selectedStore, groupByStore]);

  const handleQuantityChange = (item: GroceryItem, newQuantity: string) => {
    onUpdateItem({ ...item, quantity: newQuantity });
  };

  const handleStoreChange = (item: GroceryItem, store: string) => {
    onUpdateItem({ ...item, store });
  };

  const handleDepartmentChange = (item: GroceryItem, department: string) => {
    onUpdateItem({ ...item, department });
  };

  const toggleRecurring = (item: GroceryItem) => {
    onUpdateItem({ ...item, recurring: !item.recurring });
  };

  return (
    <section id="shopping-list" className="py-8 bg-gray-50">
      <div className="container mx-auto">
        <h2 className="text-2xl font-bold text-carrot-dark mb-6">Shopping List</h2>
        
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
                              {item.recurring && (
                                <Repeat className="h-4 w-4 text-blue-500" />
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

                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 px-2"
                              onClick={() => toggleRecurring(item)}
                            >
                              <Repeat className={`h-4 w-4 ${item.recurring ? 'text-blue-500' : 'text-gray-400'}`} />
                            </Button>
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
    </section>
  );
};
