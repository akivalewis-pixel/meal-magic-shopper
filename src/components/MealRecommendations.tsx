
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Meal } from "@/types";
import { Star } from "lucide-react";

interface MealRecommendationsProps {
  meals: Meal[];
  onSelectMeal: (meal: Meal) => void;
}

export const MealRecommendations = ({ meals, onSelectMeal }: MealRecommendationsProps) => {
  // Filter to only include rated meals, sorted by rating (highest first)
  const ratedMeals = meals
    .filter(meal => meal.rating && meal.rating > 0)
    .sort((a, b) => ((b.rating || 0) - (a.rating || 0)));

  if (ratedMeals.length === 0) {
    return null;
  }

  return (
    <div className="bg-slate-50 p-4 rounded-lg mb-6">
      <h3 className="font-semibold text-lg mb-3">Meal Recommendations</h3>
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
    </div>
  );
};
