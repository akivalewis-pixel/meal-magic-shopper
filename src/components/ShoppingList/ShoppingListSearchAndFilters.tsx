
import React from "react";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

interface ShoppingListSearchAndFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedStore: string;
  onStoreChange: (value: string) => void;
  availableStores: string[];
  viewMode: "list" | "board";
  groupByStore: boolean;
  onGroupByStoreChange: (value: boolean) => void;
}

export const ShoppingListSearchAndFilters = ({
  searchTerm,
  onSearchChange,
  selectedStore,
  onStoreChange,
  availableStores,
  viewMode,
  groupByStore,
  onGroupByStoreChange
}: ShoppingListSearchAndFiltersProps) => {
  const isMobile = useIsMobile();
  const storeOptions = ["all", "Unassigned", ...availableStores.filter(s => s !== "Unassigned")];

  return (
    <div className="space-y-3 mb-4">
      <Input
        placeholder="Search items..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        className="w-full"
      />

      {/* Store filter pills - easy tap targets on mobile */}
      <div className="flex flex-wrap gap-1.5">
        {storeOptions.map(store => (
          <button
            key={store}
            onClick={() => onStoreChange(store)}
            className={cn(
              "px-3 py-1.5 rounded-full text-xs font-medium transition-colors touch-manipulation min-h-[32px]",
              selectedStore === store
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
          >
            {store === "all" ? "All" : store}
          </button>
        ))}
      </div>
      
      {viewMode === "list" && (
        <div className="flex items-center space-x-2">
          <Switch
            id="group-by-store"
            checked={groupByStore}
            onCheckedChange={onGroupByStoreChange}
          />
          <Label htmlFor="group-by-store" className="text-sm">Group by store</Label>
        </div>
      )}
    </div>
  );
};
