
import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { DietaryPreference } from "@/types";
import { dietaryOptions } from "@/utils/constants";

interface MealPlanHeaderProps {
  dietFilter: DietaryPreference;
  onDietFilterChange: (value: DietaryPreference) => void;
  onAddRecipe: () => void;
}

export const MealPlanHeader = ({ 
  dietFilter, 
  onDietFilterChange, 
  onAddRecipe 
}: MealPlanHeaderProps) => {
  return (
    <>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold text-leaf-dark">Weekly Meal Plan</h2>
        <div className="mt-4 sm:mt-0">
          <div className="flex items-center gap-2">
            <Label htmlFor="diet-filter" className="whitespace-nowrap">
              Dietary Filter:
            </Label>
            <Select
              value={dietFilter}
              onValueChange={(value) => onDietFilterChange(value as DietaryPreference)}
            >
              <SelectTrigger id="diet-filter" className="w-[180px]">
                <SelectValue placeholder="Select diet" />
              </SelectTrigger>
              <SelectContent>
                {dietaryOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="mb-6 flex justify-end">
        <Button onClick={onAddRecipe}>
          <Plus className="mr-1 h-4 w-4" /> Add Recipe
        </Button>
      </div>
    </>
  );
};
