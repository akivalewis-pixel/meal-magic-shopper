
import React, { useState } from "react";
import { GroceryItem, GroceryCategory } from "@/types";
import { Checkbox } from "@/components/ui/checkbox";
import { groceryCategories } from "@/utils/mealPlannerUtils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface ShoppingListSectionProps {
  groceryItems: GroceryItem[];
  onToggleItem: (id: string) => void;
}

export const ShoppingListSection = ({
  groceryItems,
  onToggleItem,
}: ShoppingListSectionProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showChecked, setShowChecked] = useState(true);

  // Group items by category
  const itemsByCategory = groceryItems.reduce((acc, item) => {
    if (!showChecked && item.checked) return acc;
    
    if (searchTerm && !item.name.toLowerCase().includes(searchTerm.toLowerCase())) 
      return acc;
    
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<GroceryCategory, GroceryItem[]>);

  // Get category label
  const getCategoryLabel = (category: GroceryCategory): string => {
    return groceryCategories.find(c => c.value === category)?.label || "Other";
  };

  // Get category background color
  const getCategoryColor = (category: GroceryCategory): string => {
    return `bg-grocery-${category}`;
  };

  // Sort categories by the order in groceryCategories
  const sortedCategories = Object.keys(itemsByCategory).sort((a, b) => {
    const categoryOrder = groceryCategories.map(cat => cat.value);
    return categoryOrder.indexOf(a as GroceryCategory) - categoryOrder.indexOf(b as GroceryCategory);
  }) as GroceryCategory[];

  return (
    <section id="shopping-list" className="py-8 bg-gray-50">
      <div className="container mx-auto">
        <h2 className="text-2xl font-bold text-carrot-dark mb-6">Shopping List</h2>
        
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <Label htmlFor="search-items">Search Items</Label>
            <Input
              id="search-items"
              type="text"
              placeholder="Search ingredients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="flex items-end">
            <Button 
              variant="outline" 
              onClick={() => setShowChecked(!showChecked)}
              className="whitespace-nowrap"
            >
              {showChecked ? "Hide Checked Items" : "Show Checked Items"}
            </Button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          {sortedCategories.map((category) => (
            <div key={category} className={`grocery-category ${getCategoryColor(category)}`}>
              <h3 className="font-medium mb-2">{getCategoryLabel(category)}</h3>
              <ul className="space-y-2">
                {itemsByCategory[category]?.map((item) => (
                  <li key={item.id} className="flex items-center gap-3">
                    <Checkbox
                      id={item.id}
                      checked={item.checked}
                      onCheckedChange={() => onToggleItem(item.id)}
                    />
                    <Label
                      htmlFor={item.id}
                      className={`flex flex-1 justify-between ${
                        item.checked ? "line-through text-gray-400" : ""
                      }`}
                    >
                      <span>{item.name}</span>
                      <span className="text-sm text-gray-500">{item.quantity}</span>
                    </Label>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          
          {sortedCategories.length === 0 && (
            <div className="text-center py-10 text-gray-500">
              <p>No items in your shopping list</p>
              {searchTerm && <p className="text-sm mt-2">Try a different search term</p>}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
