
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

interface PantrySectionProps {
  pantryItems: string[];
  onAddItem: (item: string) => void;
  onRemoveItem: (item: string) => void;
}

export const PantrySection = ({
  pantryItems,
  onAddItem,
  onRemoveItem,
}: PantrySectionProps) => {
  const [newItem, setNewItem] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const handleAddItem = () => {
    if (newItem.trim() !== "") {
      onAddItem(newItem.trim());
      setNewItem("");
    }
  };

  const filteredItems = pantryItems.filter((item) =>
    item.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <section id="pantry" className="py-8 bg-gray-50">
      <div className="container mx-auto">
        <h2 className="text-2xl font-bold text-leaf-dark mb-6">Pantry Items</h2>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <Label htmlFor="add-item">Add Item to Pantry</Label>
              <div className="flex gap-2">
                <Input
                  id="add-item"
                  value={newItem}
                  onChange={(e) => setNewItem(e.target.value)}
                  placeholder="e.g., flour, sugar, salt"
                  onKeyDown={(e) => e.key === "Enter" && handleAddItem()}
                />
                <Button onClick={handleAddItem}>Add</Button>
              </div>
            </div>
            <div className="flex-1">
              <Label htmlFor="search-pantry">Search Pantry</Label>
              <Input
                id="search-pantry"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search pantry items..."
              />
            </div>
          </div>

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
        </div>
      </div>
    </section>
  );
};
