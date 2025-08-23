
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Settings, RefreshCw, History } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ShareButton, generateShoppingListContent } from "@/components/Share";
import { GroceryItem } from "@/types";
import { FrequentItemsDialog } from "./FrequentItemsDialog";

interface ShoppingListHeaderProps {
  onEditStores: () => void;
  onSortChange: (value: "store" | "department" | "category") => void;
  sortBy: "store" | "department" | "category";
  onAddItem: () => void;
  canAddItem: boolean;
  onResetList?: () => void;
  groceryItems?: GroceryItem[];
  onAddItems?: (items: Omit<GroceryItem, 'id' | 'checked'>[]) => void;
}

export const ShoppingListHeader = ({
  onEditStores,
  onSortChange,
  sortBy,
  onAddItem,
  canAddItem,
  onResetList,
  groceryItems = [],
  onAddItems
}: ShoppingListHeaderProps) => {
  const [showFrequentItems, setShowFrequentItems] = useState(false);
  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-6">
      <h2 className="text-2xl font-bold text-gray-800">Shopping List</h2>
      
      <div className="flex flex-wrap gap-2">
        {canAddItem && (
          <Button onClick={onAddItem} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Item
          </Button>
        )}

        {groceryItems.length > 0 && (
          <ShareButton
            title="Shopping List"
            content={generateShoppingListContent(groceryItems.filter(item => !item.checked))}
            type="shopping-list"
            variant="outline"
          />
        )}
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-white z-50">
            {canAddItem && (
              <DropdownMenuItem onClick={onAddItem}>
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </DropdownMenuItem>
            )}
            {onAddItems && (
              <DropdownMenuItem onClick={() => setShowFrequentItems(true)}>
                <History className="h-4 w-4 mr-2" />
                Add Frequent Items
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={onEditStores}>
              <Settings className="h-4 w-4 mr-2" />
              Add/Edit Stores
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Sort by {sortBy}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-white z-50">
            <DropdownMenuItem onClick={() => onSortChange("store")}>
              Sort by Store
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onSortChange("department")}>
              Sort by Department
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onSortChange("category")}>
              Sort by Category
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {onResetList && (
          <Button 
            variant="outline" 
            onClick={onResetList}
            className="flex items-center gap-2 text-red-600 hover:text-red-700"
          >
            <RefreshCw className="h-4 w-4" />
            Reset List
          </Button>
        )}
      </div>

      {onAddItems && (
        <FrequentItemsDialog
          isOpen={showFrequentItems}
          onClose={() => setShowFrequentItems(false)}
          onAddItems={onAddItems}
          currentItems={groceryItems}
        />
      )}
    </div>
  );
};
