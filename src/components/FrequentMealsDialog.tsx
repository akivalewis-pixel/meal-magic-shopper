import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star, Plus } from "lucide-react";
import { WeeklyMealPlan, Meal } from "@/types";
import { getFrequentlyUsedMeals } from "@/utils/mealUtils";

interface FrequentMealsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  weeklyPlans: WeeklyMealPlan[];
  onAddMealToCurrentPlan: (meal: Meal, day: string) => void;
}

export const FrequentMealsDialog = ({
  open,
  onOpenChange,
  weeklyPlans,
  onAddMealToCurrentPlan,
}: FrequentMealsDialogProps) => {
  const frequentMeals = getFrequentlyUsedMeals(weeklyPlans);

  const handleAddMeal = (meal: Meal) => {
    // Add to the first available day or Sunday as default
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const targetDay = daysOfWeek[0]; // Default to Sunday for now
    onAddMealToCurrentPlan(meal, targetDay);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Frequently Used Meals</DialogTitle>
        </DialogHeader>
        
        <div className="mt-4">
          {frequentMeals.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {frequentMeals.map(({ meal, count }) => (
                <Card key={`${meal.title}-${count}`} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center justify-between">
                      <span className="flex-1">{meal.title}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                          Used {count}x
                        </span>
                        <Button
                          size="sm"
                          onClick={() => handleAddMeal(meal)}
                          className="h-8 w-8 p-0"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {meal.rating && (
                      <div className="flex items-center gap-1 mb-2">
                        {Array.from({ length: 5 }, (_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < meal.rating
                                ? "text-yellow-400 fill-current"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                        <span className="text-sm text-gray-600 ml-1">
                          ({meal.rating}/5)
                        </span>
                      </div>
                    )}
                    {meal.notes && (
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {meal.notes}
                      </p>
                    )}
                    {meal.ingredients && meal.ingredients.length > 0 && (
                      <p className="text-xs text-gray-500 mt-2">
                        {meal.ingredients.slice(0, 3).join(", ")}
                        {meal.ingredients.length > 3 && "..."}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No frequently used meals found.</p>
              <p className="text-sm mt-2">
                Meals that appear in multiple saved plans will show up here.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};