
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DietaryPreference } from "@/types";
import { MealPlanResetDialog } from "./MealPlanResetDialog";
import { Plus, RotateCcw } from "lucide-react";

interface MealPlanHeaderProps {
  dietFilter: DietaryPreference;
  onDietFilterChange: (diet: DietaryPreference) => void;
  onAddRecipe: () => void;
  onResetMealPlan?: () => void;
  onSaveCurrentPlan?: (name: string) => void;
  hasMeals?: boolean;
}

export const MealPlanHeader = ({ 
  dietFilter, 
  onDietFilterChange, 
  onAddRecipe,
  onResetMealPlan,
  onSaveCurrentPlan,
  hasMeals = false
}: MealPlanHeaderProps) => {
  const [showResetDialog, setShowResetDialog] = useState(false);

  const handleSaveAndReset = (planName: string) => {
    if (onSaveCurrentPlan) {
      onSaveCurrentPlan(planName);
    }
    if (onResetMealPlan) {
      onResetMealPlan();
    }
  };

  const handleResetWithoutSaving = () => {
    if (onResetMealPlan) {
      onResetMealPlan();
    }
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-carrot-dark mb-4 sm:mb-0">Weekly Meal Plan</h2>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <Select value={dietFilter} onValueChange={onDietFilterChange}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by diet" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">All Diets</SelectItem>
              <SelectItem value="vegetarian">Vegetarian</SelectItem>
              <SelectItem value="vegan">Vegan</SelectItem>
              <SelectItem value="gluten-free">Gluten-Free</SelectItem>
              <SelectItem value="keto">Keto</SelectItem>
              <SelectItem value="paleo">Paleo</SelectItem>
            </SelectContent>
          </Select>
          
          <div className="flex gap-2">
            <Button onClick={onAddRecipe} className="flex-1 sm:flex-none">
              <Plus className="w-4 h-4 mr-2" />
              Add Recipe
            </Button>
            
            {onResetMealPlan && (
              <Button 
                variant="outline" 
                onClick={() => setShowResetDialog(true)}
                className="flex-1 sm:flex-none"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset Plan
              </Button>
            )}
          </div>
        </div>
      </div>

      <MealPlanResetDialog
        isOpen={showResetDialog}
        onClose={() => setShowResetDialog(false)}
        onResetWithoutSaving={handleResetWithoutSaving}
        onSaveAndReset={handleSaveAndReset}
        hasMeals={hasMeals}
      />
    </>
  );
};
