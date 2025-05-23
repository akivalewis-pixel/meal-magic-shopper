
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

interface ShoppingListFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedStore: string;
  onStoreFilterChange: (value: string) => void;
  availableStores: string[];
}

export const ShoppingListFilters = ({
  searchTerm,
  onSearchChange,
  selectedStore,
  onStoreFilterChange,
  availableStores
}: ShoppingListFiltersProps) => {
  return (
    <div className="flex flex-col md:flex-row gap-4 mb-6">
      <div className="flex-1">
        <Label htmlFor="search-items">Search Items</Label>
        <Input
          id="search-items"
          type="text"
          placeholder="Search ingredients..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full"
        />
      </div>
      <div className="flex flex-col sm:flex-row gap-2">
        <div>
          <Label htmlFor="store-filter">Store Filter</Label>
          <Select
            value={selectedStore}
            onValueChange={onStoreFilterChange}
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
      </div>
    </div>
  );
};
