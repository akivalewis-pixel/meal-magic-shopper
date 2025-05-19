
import React from "react";
import { Button } from "@/components/ui/button";
import { Edit, List } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Store } from "lucide-react";

interface ShoppingListHeaderProps {
  onEditStores: () => void;
  onSortChange: (value: "store" | "department" | "category") => void;
  sortBy: "store" | "department" | "category";
}

export const ShoppingListHeader = ({ 
  onEditStores, 
  onSortChange,
  sortBy 
}: ShoppingListHeaderProps) => {
  return (
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
            <DropdownMenuItem onClick={() => onSortChange("store")}>
              <Store className="mr-2 h-4 w-4" /> Store
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onSortChange("department")}>
              <List className="mr-2 h-4 w-4" /> Department
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onSortChange("category")}>
              <List className="mr-2 h-4 w-4" /> Category
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
        <Button 
          variant="outline" 
          onClick={onEditStores}
        >
          <Edit className="mr-2 h-4 w-4" />
          Customize Stores
        </Button>
      </div>
    </div>
  );
};
