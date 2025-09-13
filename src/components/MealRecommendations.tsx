
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Meal, WeeklyMealPlan } from "@/types";
import { Star, TrendingUp } from "lucide-react";
import { FrequentMealsDialog } from "./FrequentMealsDialog";

interface MealRecommendationsProps {
  meals: Meal[];
  weeklyPlans: WeeklyMealPlan[];
  onSelectMeal: (meal: Meal) => void;
  onAddMealToCurrentPlan: (meal: Meal, day: string) => void;
}

export const MealRecommendations = ({ 
  meals, 
  weeklyPlans, 
  onSelectMeal, 
  onAddMealToCurrentPlan 
}: MealRecommendationsProps) => {
  const [showFrequentMeals, setShowFrequentMeals] = useState(false);
  
  // Filter to only include rated meals, sorted by rating (highest first)
  const ratedMeals = meals
    .filter(meal => meal.rating && meal.rating > 0)
    .sort((a, b) => ((b.rating || 0) - (a.rating || 0)));

  if (ratedMeals.length === 0) {
    return (
      <div className="bg-slate-50 p-4 rounded-lg mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-lg">Meal Recommendations</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFrequentMeals(true)}
            className="flex items-center gap-2"
          >
            <TrendingUp className="h-4 w-4" />
            Frequent Meals
          </Button>
        </div>
        <p className="text-gray-600 text-sm">No rated meals yet. Rate some meals to see recommendations here!</p>
        
        <FrequentMealsDialog
          open={showFrequentMeals}
          onOpenChange={setShowFrequentMeals}
          weeklyPlans={weeklyPlans}
          onAddMealToCurrentPlan={onAddMealToCurrentPlan}
        />
      </div>
    );
  }

  return (
    <div className="bg-slate-50 p-4 rounded-lg mb-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-lg">Meal Recommendations</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowFrequentMeals(true)}
          className="flex items-center gap-2"
        >
          <TrendingUp className="h-4 w-4" />
          Frequent Meals
        </Button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {ratedMeals.slice(0, 3).map((meal) => (
          <Card 
            key={meal.id}
            className="cursor-pointer hover:bg-slate-100 transition-colors"
            onClick={() => onSelectMeal(meal)}
          >
            <CardHeader className="p-3 pb-2">
              <CardTitle className="text-sm font-medium flex items-center justify-between">
                {meal.title}
                <span className="flex items-center text-yellow-400">
                  {meal.rating} <Star className="ml-1 h-4 w-4" />
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0 text-xs text-gray-600">
              {meal.notes ? (
                <p className="line-clamp-2">{meal.notes}</p>
              ) : (
                <p>Click to add to meal plan</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
      
      <FrequentMealsDialog
        open={showFrequentMeals}
        onOpenChange={setShowFrequentMeals}
        weeklyPlans={weeklyPlans}
        onAddMealToCurrentPlan={onAddMealToCurrentPlan}
      />
    </div>
  );
};
