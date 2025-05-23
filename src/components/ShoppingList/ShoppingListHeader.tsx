
import React from "react";
import { Button } from "@/components/ui/button";
import { Plus, Settings, RefreshCw } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ShoppingListHeaderProps {
  onEditStores: () => void;
  onSortChange: (value: "store" | "department" | "category") => void;
  sortBy: "store" | "department" | "category";
  onAddItem: () => void;
  canAddItem: boolean;
  onResetList?: () => void;
}

export const ShoppingListHeader = ({
  onEditStores,
  onSortChange,
  sortBy,
  onAddItem,
  canAddItem,
  onResetList
}: ShoppingListHeaderProps) => {
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
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {canAddItem && (
              <DropdownMenuItem onClick={onAddItem}>
                Add Item
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={onEditStores}>
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
          <DropdownMenuContent>
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
    </div>
  );
};
