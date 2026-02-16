
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { MealPlanResetDialog } from "./MealPlanResetDialog";
import { Plus, RotateCcw } from "lucide-react";
import { ShareButton, generateWeeklyMealPlanContent } from "@/components/Share";
import { Meal } from "@/types";

interface MealPlanHeaderProps {
  onAddRecipe: () => void;
  onResetMealPlan?: () => void;
  onSaveCurrentPlan?: (name: string) => void;
  hasMeals?: boolean;
  meals?: Meal[];
}

export const MealPlanHeader = ({ 
  onAddRecipe,
  onResetMealPlan,
  onSaveCurrentPlan,
  hasMeals = false,
  meals = []
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
      <div className="flex items-center justify-between mb-4 gap-2">
        <h2 className="text-xl sm:text-2xl font-bold text-foreground truncate">Meal Plan</h2>
        
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <Button size="sm" onClick={onAddRecipe} className="gap-1">
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Recipe</span>
          </Button>
          
          {hasMeals && (
            <ShareButton
              title="Weekly Meal Plan"
              content={generateWeeklyMealPlanContent(meals)}
              type="meal-plan"
              variant="outline"
              size="sm"
            />
          )}
          
          {onResetMealPlan && (
            <Button 
              variant="outline"
              size="sm"
              onClick={() => setShowResetDialog(true)}
              className="gap-1"
            >
              <RotateCcw className="w-4 h-4" />
              <span className="hidden sm:inline">Reset</span>
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
