
import React from "react";
import { Button } from "@/components/ui/button";
import { Edit, Plus, List } from "lucide-react";
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
  onAddItem?: () => void;
  canAddItem?: boolean;
}

export const ShoppingListHeader = ({ 
  onEditStores, 
  onSortChange,
  sortBy,
  onAddItem,
  canAddItem = false
}: ShoppingListHeaderProps) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
      <h2 className="text-2xl font-bold text-carrot-dark mb-4 sm:mb-0">Shopping List</h2>
      <div className="flex gap-2">
        {/* Combined Add dropdown menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              Add
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {canAddItem && onAddItem && (
              <DropdownMenuItem onClick={onAddItem}>
                Add Item
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={onEditStores}>
              <Edit className="mr-2 h-4 w-4" />
              Manage Stores
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
        {/* Sort dropdown menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <List className="mr-2 h-4 w-4" />
              Sort By: {sortBy === "store" ? "Store" : sortBy === "department" ? "Department" : "Category"}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onSortChange("store")}>
              Store
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onSortChange("department")}>
              Department
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onSortChange("category")}>
              Category
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};
