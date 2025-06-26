
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { MealPlanResetDialog } from "./MealPlanResetDialog";
import { Plus, RotateCcw } from "lucide-react";

interface MealPlanHeaderProps {
  onAddRecipe: () => void;
  onResetMealPlan?: () => void;
  onSaveCurrentPlan?: (name: string) => void;
  hasMeals?: boolean;
}

export const MealPlanHeader = ({ 
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
        
        <div className="flex gap-2">
          <Button onClick={onAddRecipe}>
            <Plus className="w-4 h-4 mr-2" />
            Add Recipe
          </Button>
          
          {onResetMealPlan && (
            <Button 
              variant="outline" 
              onClick={() => setShowResetDialog(true)}
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset Plan
            </Button>
          )}
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
