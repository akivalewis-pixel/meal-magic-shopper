
import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { DietaryPreference } from "@/types";
import { dietaryOptions } from "@/utils/constants";
import { useIsMobile } from "@/hooks/use-mobile";

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
  const isMobile = useIsMobile();
  
  return (
    <>
      <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h2 className="text-xl sm:text-2xl font-bold text-leaf-dark">Weekly Meal Plan</h2>
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Label htmlFor="diet-filter" className="whitespace-nowrap">
              Filter:
            </Label>
            <Select
              value={dietFilter}
              onValueChange={(value) => onDietFilterChange(value as DietaryPreference)}
            >
              <SelectTrigger id="diet-filter" className="w-[140px] sm:w-[180px]">
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

      <div className="mb-4 sm:mb-6 flex justify-end">
        <Button onClick={onAddRecipe} className="w-full sm:w-auto">
          <Plus className="mr-1 h-4 w-4" /> Add Recipe
        </Button>
      </div>
    </>
  );
};
