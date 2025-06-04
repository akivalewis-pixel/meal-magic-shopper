
import React from "react";
import { Button } from "@/components/ui/button";
import { Plus, Settings, RefreshCw, LayoutGrid, List, Store } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

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
  const isMobile = useIsMobile();
  
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex items-center gap-1">
        <Button
          variant={viewMode === "list" ? "default" : "outline"}
          size={isMobile ? "icon" : "sm"}
          onClick={() => onViewModeChange("list")}
          title="List View"
        >
          <List className="h-4 w-4" />
          {!isMobile && <span className="ml-1">List</span>}
        </Button>
        <Button
          variant={viewMode === "board" ? "default" : "outline"}
          size={isMobile ? "icon" : "sm"}
          onClick={() => onViewModeChange("board")}
          title="Board View"
        >
          <LayoutGrid className="h-4 w-4" />
          {!isMobile && <span className="ml-1">Board</span>}
        </Button>
      </div>
      
      <Button
        variant="outline"
        size={isMobile ? "icon" : "sm"}
        onClick={onManageStores}
        title="Manage Stores"
      >
        <Store className="h-4 w-4" />
        {!isMobile && <span className="ml-1">Stores</span>}
      </Button>
      <Button
        variant="outline"
        size={isMobile ? "icon" : "sm"}
        onClick={onAddItem}
        title="Add Item"
      >
        <Plus className="h-4 w-4" />
        {!isMobile && <span className="ml-1">Add</span>}
      </Button>
      <Button
        variant="outline"
        size={isMobile ? "icon" : "sm"}
        onClick={onReset}
        className="text-red-600"
        title="Reset List"
      >
        <RefreshCw className="h-4 w-4" />
        {!isMobile && <span className="ml-1">Reset</span>}
      </Button>
    </div>
  );
};
