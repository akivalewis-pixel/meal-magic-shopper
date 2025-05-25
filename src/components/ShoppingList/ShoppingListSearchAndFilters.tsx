
import React from "react";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

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
  return (
    <div className="flex flex-wrap gap-4 mb-6">
      <Input
        placeholder="Search items..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        className="max-w-xs"
      />
      
      <Select value={selectedStore} onValueChange={onStoreChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Filter by store" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Stores</SelectItem>
          <SelectItem value="Unassigned">Unassigned</SelectItem>
          {availableStores
            .filter(store => store !== "Unassigned")
            .map(store => (
              <SelectItem key={store} value={store}>
                {store}
              </SelectItem>
            ))}
        </SelectContent>
      </Select>
      
      {viewMode === "list" && (
        <div className="flex items-center space-x-2">
          <Switch
            id="group-by-store"
            checked={groupByStore}
            onCheckedChange={onGroupByStoreChange}
          />
          <Label htmlFor="group-by-store">Group by store</Label>
        </div>
      )}
    </div>
  );
};
