
import React from "react";
import { Badge } from "@/components/ui/badge";

interface PantryItemListProps {
  items: string[];
  onRemoveItem: (item: string) => void;
  searchTerm: string;
}

export const PantryItemList = ({ items, onRemoveItem, searchTerm }: PantryItemListProps) => {
  const filteredItems = items.filter((item) =>
    item.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="mt-4">
      <h3 className="font-medium mb-2">Current Pantry Items:</h3>
      {filteredItems.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {filteredItems.map((item, index) => (
            <Badge
              key={index}
              variant="secondary"
              className="flex gap-1 items-center px-3 py-1"
            >
              {item}
              <button
                className="ml-1 text-xs hover:text-red-500"
                onClick={() => onRemoveItem(item)}
              >
                ✕
              </button>
            </Badge>
          ))}
        </div>
      ) : (
        <p className="text-gray-500">
          {searchTerm
            ? "No matching pantry items found"
            : "No items in your pantry yet"}
        </p>
      )}
    </div>
  );
};
