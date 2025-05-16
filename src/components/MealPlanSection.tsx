
import React, { useState } from "react";
import { MealCard } from "./MealCard";
import { Meal, DietaryPreference } from "@/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { daysOfWeek, dietaryOptions, filterMealsByDiet } from "@/utils/mealPlannerUtils";

interface MealPlanSectionProps {
  meals: Meal[];
  onEditMeal: (meal: Meal) => void;
}

export const MealPlanSection = ({ meals, onEditMeal }: MealPlanSectionProps) => {
  const [dietFilter, setDietFilter] = useState<DietaryPreference>("none");
  
  const filteredMeals = dietFilter === "none" 
    ? meals 
    : filterMealsByDiet(meals, dietFilter);

  const getMealForDay = (day: string) => {
    return filteredMeals.find(meal => meal.day === day) || null;
  };

  return (
    <section id="meal-plan" className="py-8">
      <div className="container mx-auto">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-2xl font-bold text-leaf-dark">Weekly Meal Plan</h2>
          <div className="mt-4 sm:mt-0">
            <div className="flex items-center gap-2">
              <Label htmlFor="diet-filter" className="whitespace-nowrap">
                Dietary Filter:
              </Label>
              <Select
                value={dietFilter}
                onValueChange={(value) => setDietFilter(value as DietaryPreference)}
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

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-7">
          {daysOfWeek.map((day) => {
            const meal = getMealForDay(day);
            return (
              <div key={day} className="flex flex-col">
                <h3 className="mb-2 text-center font-semibold">{day}</h3>
                {meal ? (
                  <MealCard meal={meal} onEdit={onEditMeal} />
                ) : (
                  <div className="meal-card flex h-full flex-col items-center justify-center p-4 text-center text-muted-foreground">
                    <p className="mb-2">No meal planned</p>
                    <p className="text-sm">
                      {dietFilter !== "none" ? "Try changing the filter or " : ""}
                      Click to add a meal
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
