
import React, { useState } from "react";
import { GroceryItem, GroceryCategory } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { groceryCategories } from "@/utils/constants";

interface MultiSelectActionsProps {
  selectedItems: GroceryItem[];
  onUpdateMultiple: (items: GroceryItem[], updates: Partial<GroceryItem>) => void;
  onClearSelection: () => void;
  availableStores: string[];
}

export const MultiSelectActions = ({
  selectedItems,
  onUpdateMultiple,
  onClearSelection,
  availableStores
}: MultiSelectActionsProps) => {
  const [selectedStore, setSelectedStore] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<GroceryCategory | "">("");

  if (selectedItems.length === 0) return null;

  const handleMoveToStore = () => {
    if (selectedStore) {
      onUpdateMultiple(selectedItems, { store: selectedStore });
      setSelectedStore("");
    }
  };

  const handleMoveToCategory = () => {
    if (selectedCategory) {
      onUpdateMultiple(selectedItems, { category: selectedCategory as GroceryCategory });
      setSelectedCategory("");
    }
  };

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value as GroceryCategory | "");
  };

  return (
    <div className="bg-primary/10 p-4 rounded-lg mb-4">
      <div className="flex items-center justify-between mb-3">
        <span className="font-medium">
          {selectedItems.length} item{selectedItems.length > 1 ? 's' : ''} selected
        </span>
        <Button variant="outline" size="sm" onClick={onClearSelection}>
          Clear Selection
        </Button>
      </div>
      
      <div className="flex gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <Select value={selectedStore} onValueChange={setSelectedStore}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Move to store" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Unassigned</SelectItem>
              {availableStores.filter(s => s !== "Any Store").map(store => (
                <SelectItem key={store} value={store}>
                  {store}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button size="sm" onClick={handleMoveToStore} disabled={!selectedStore}>
            Move
          </Button>
        </div>
        
        <div className="flex items-center gap-2">
          <Select value={selectedCategory} onValueChange={handleCategoryChange}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Move to category" />
            </SelectTrigger>
            <SelectContent>
              {groceryCategories.map(cat => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button size="sm" onClick={handleMoveToCategory} disabled={!selectedCategory}>
            Move
          </Button>
        </div>
      </div>
    </div>
  );
};
