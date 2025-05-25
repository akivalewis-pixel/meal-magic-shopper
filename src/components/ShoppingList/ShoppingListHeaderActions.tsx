
import React from "react";
import { Button } from "@/components/ui/button";
import { Plus, Settings, RefreshCw, LayoutGrid, List, Store } from "lucide-react";

interface ShoppingListHeaderActionsProps {
  viewMode: "list" | "board";
  onViewModeChange: (mode: "list" | "board") => void;
  onManageStores: () => void;
  onAddItem: () => void;
  onReset: () => void;
}

export const ShoppingListHeaderActions = ({
  viewMode,
  onViewModeChange,
  onManageStores,
  onAddItem,
  onReset
}: ShoppingListHeaderActionsProps) => {
  return (
    <div className="flex items-center gap-2">
      <Button
        variant={viewMode === "list" ? "default" : "outline"}
        size="sm"
        onClick={() => onViewModeChange("list")}
      >
        <List className="h-4 w-4" />
      </Button>
      <Button
        variant={viewMode === "board" ? "default" : "outline"}
        size="sm"
        onClick={() => onViewModeChange("board")}
      >
        <LayoutGrid className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={onManageStores}
        className="flex items-center gap-2"
      >
        <Store className="h-4 w-4" />
        Manage Stores
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={onAddItem}
        className="flex items-center gap-2"
      >
        <Plus className="h-4 w-4" />
        Add Item
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={onReset}
        className="text-red-600"
      >
        <RefreshCw className="h-4 w-4" />
        Reset
      </Button>
    </div>
  );
};
