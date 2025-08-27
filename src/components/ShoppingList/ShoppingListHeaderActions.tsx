
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Plus, 
  Settings, 
  RefreshCw, 
  List, 
  Store,
  Tags,
  History
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CategoryManagementDialog } from "./CategoryManagementDialog";
import { FrequentItemsDialog } from "./FrequentItemsDialog";
import { GroceryItem } from "@/types";

interface ShoppingListHeaderActionsProps {
  viewMode: "list" | "board";
  onViewModeChange: (mode: "list" | "board") => void;
  onManageStores: () => void;
  onAddItem: () => void;
  onReset: () => void;
  onAddItems?: (items: Omit<GroceryItem, 'id' | 'checked'>[]) => void;
  groceryItems?: GroceryItem[];
}

export const ShoppingListHeaderActions = ({
  onManageStores,
  onAddItem,
  onReset,
  onAddItems,
  groceryItems = []
}: ShoppingListHeaderActionsProps) => {
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [showFrequentItems, setShowFrequentItems] = useState(false);

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onManageStores}
          className="flex items-center gap-1"
        >
          <Store className="h-4 w-4" />
          <span className="hidden sm:inline">Stores</span>
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsCategoryDialogOpen(true)}
          className="flex items-center gap-1"
        >
          <Tags className="h-4 w-4" />
          <span className="hidden sm:inline">Categories</span>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="flex items-center gap-1">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Add</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onAddItem}>
              Add Item
            </DropdownMenuItem>
            {onAddItems && (
              <DropdownMenuItem onClick={() => setShowFrequentItems(true)}>
                <History className="h-4 w-4 mr-2" />
                Add Frequent Items
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={onManageStores}>
              Manage Stores
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setIsCategoryDialogOpen(true)}>
              Manage Categories
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button 
          variant="outline" 
          size="sm"
          onClick={onReset}
          className="flex items-center gap-1 text-red-600 hover:text-red-700"
        >
          <RefreshCw className="h-4 w-4" />
          <span className="hidden sm:inline">Reset</span>
        </Button>
      </div>

      <CategoryManagementDialog
        open={isCategoryDialogOpen}
        onOpenChange={setIsCategoryDialogOpen}
      />

      {onAddItems && (
        <FrequentItemsDialog
          isOpen={showFrequentItems}
          onClose={() => setShowFrequentItems(false)}
          onAddItems={onAddItems}
          currentItems={groceryItems}
        />
      )}
    </>
  );
};
