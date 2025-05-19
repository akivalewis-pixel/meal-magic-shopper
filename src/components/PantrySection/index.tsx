
import React, { useState } from "react";
import { PantryForm } from "./PantryForm";
import { PantrySearch } from "./PantrySearch";
import { PantryItemList } from "./PantryItemList";

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
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <section id="pantry" className="py-8 bg-gray-50">
      <div className="container mx-auto">
        <h2 className="text-2xl font-bold text-leaf-dark mb-6">Pantry Items</h2>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <PantryForm onAddItem={onAddItem} pantryItems={pantryItems} />
            <PantrySearch searchTerm={searchTerm} onSearchChange={setSearchTerm} />
          </div>

          <PantryItemList 
            items={pantryItems} 
            onRemoveItem={onRemoveItem} 
            searchTerm={searchTerm} 
          />
        </div>
      </div>
    </section>
  );
};
