
import React, { useState } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { MealRatingDialog } from "../MealRatingDialog";
import { MealRecommendations } from "../MealRecommendations";
import { DroppableDay } from "./DroppableDay";
import { AddRecipeDialog } from "./AddRecipeDialog";
import { Meal, DietaryPreference } from "@/types";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { daysOfWeek, dietaryOptions, filterMealsByDiet, extractIngredientsFromRecipeUrl } from "@/utils/mealPlannerUtils";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Plus } from "lucide-react";

interface MealPlanSectionProps {
  meals: Meal[];
  onEditMeal: (meal: Meal) => void;
  onRateMeal: (meal: Meal, rating: number, notes: string) => void;
  onAddMealToDay: (meal: Meal, day: string) => void;
}

export const MealPlanSection = ({ 
  meals, 
  onEditMeal, 
  onRateMeal,
  onAddMealToDay 
}: MealPlanSectionProps) => {
  const [dietFilter, setDietFilter] = useState<DietaryPreference>("none");
  const [mealToRate, setMealToRate] = useState<Meal | null>(null);
  const [showAddRecipe, setShowAddRecipe] = useState(false);
  const [selectedDay, setSelectedDay] = useState("");
  
  const filteredMeals = dietFilter === "none" 
    ? meals 
    : filterMealsByDiet(meals, dietFilter);

  // Get meals for a specific day
  const getMealsForDay = (day: string) => {
    return filteredMeals.filter(meal => meal.day === day);
  };

  const handleOpenRatingDialog = (meal: Meal) => {
    setMealToRate(meal);
  };

  const handleCloseRatingDialog = () => {
    setMealToRate(null);
  };

  const handleSaveRating = (meal: Meal, rating: number, notes: string) => {
    onRateMeal(meal, rating, notes);
    setMealToRate(null);
  };

  const handleSelectRecommendation = (meal: Meal) => {
    // Find the first day without a meal
    const dayWithoutMeal = daysOfWeek.find(day => !meals.some(m => m.day === day));
    if (dayWithoutMeal) {
      onAddMealToDay(meal, dayWithoutMeal);
    } else {
      // If all days have meals, suggest adding to Sunday
      onAddMealToDay(meal, 'Sunday');
    }
  };

  const handleMoveMeal = (meal: Meal, fromDay: string, toDay: string) => {
    // Create a copy of the meal with the new day
    const updatedMeal = { ...meal, day: toDay };
    
    // Add to the new day
    onAddMealToDay(updatedMeal, toDay);
  };

  const handleRemoveMeal = (meal: Meal) => {
    // Create a copy of the meal with empty day to remove it
    const updatedMeal = { ...meal, day: "" };
    onAddMealToDay(updatedMeal, "");
  };

  const handleAddNewRecipe = (day: string) => {
    setSelectedDay(day);
    setShowAddRecipe(true);
  };

  const handleAddRecipeSubmit = (data: any) => {
    const newMeal: Meal = {
      id: `${selectedDay}-${Date.now()}`,
      day: selectedDay,
      title: data.title,
      recipeUrl: data.recipeUrl,
      ingredients: data.ingredients,
      dietaryPreferences: Array.isArray(data.dietaryPreferences) 
        ? data.dietaryPreferences 
        : [data.dietaryPreferences] as DietaryPreference[],
      lastUsed: new Date()
    };
    
    onAddMealToDay(newMeal, selectedDay);
    setShowAddRecipe(false);
  };

  return (
    <DndProvider backend={HTML5Backend}>
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

          <div className="mb-6 flex justify-end">
            <Button onClick={() => {
              setSelectedDay(daysOfWeek.find(day => !getMealsForDay(day).length) || 'Sunday');
              setShowAddRecipe(true);
            }}>
              <Plus className="mr-1 h-4 w-4" /> Add Recipe
            </Button>
          </div>

          <MealRecommendations 
            meals={meals}
            onSelectMeal={handleSelectRecommendation}
          />

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-7">
            {daysOfWeek.map((day) => (
              <DroppableDay 
                key={day} 
                day={day} 
                meals={getMealsForDay(day)}
                onDrop={handleMoveMeal}
                onEdit={onEditMeal}
                onRate={handleOpenRatingDialog}
                onMove={handleMoveMeal}
                onAddMeal={handleAddNewRecipe}
                onRemove={handleRemoveMeal}
              />
            ))}
          </div>
          
          {mealToRate && (
            <MealRatingDialog 
              meal={mealToRate}
              isOpen={true}
              onClose={handleCloseRatingDialog}
              onSaveRating={handleSaveRating}
            />
          )}

          <AddRecipeDialog 
            isOpen={showAddRecipe}
            onClose={() => setShowAddRecipe(false)}
            onAddRecipe={handleAddRecipeSubmit}
            selectedDay={selectedDay}
            onFetchIngredients={extractIngredientsFromRecipeUrl}
          />
        </div>
      </section>
    </DndProvider>
  );
};
