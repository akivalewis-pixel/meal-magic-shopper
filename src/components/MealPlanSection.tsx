
import React, { useState } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { MealRatingDialog } from "./MealRatingDialog";
import { MealRecommendations } from "./MealRecommendations";
import { AddRecipeDialog } from "./MealPlan/AddRecipeDialog";
import { DroppableDay } from "./MealPlan/DroppableDay";
import { MealPlanHeader } from "./MealPlan/MealPlanHeader";
import { Meal, DietaryPreference } from "@/types";
import { daysOfWeek } from "@/utils/constants";
import { filterMealsByDiet } from "@/utils/mealUtils";
import { useToast } from "@/hooks/use-toast";
import { extractIngredientsFromRecipeUrl } from "@/utils/recipeUtils";
import { v4 as uuidv4 } from 'uuid';

interface MealPlanSectionProps {
  meals: Meal[];
  onEditMeal: (meal: Meal) => void;
  onUpdateMeal: (updatedMeal: Meal) => void;
  onRateMeal: (meal: Meal, rating: number, notes: string) => void;
  onAddMealToDay: (meal: Meal, day: string) => void;
  onResetMealPlan: () => void;
}

export const MealPlanSection = ({ 
  meals, 
  onEditMeal, 
  onUpdateMeal,
  onRateMeal,
  onAddMealToDay,
  onResetMealPlan
}: MealPlanSectionProps) => {
  const { toast } = useToast();
  const [dietFilter, setDietFilter] = useState<DietaryPreference>("none");
  const [mealToRate, setMealToRate] = useState<Meal | null>(null);
  const [showAddRecipe, setShowAddRecipe] = useState(false);
  const [selectedDay, setSelectedDay] = useState("");
  const [editingMeal, setEditingMeal] = useState<Meal | null>(null);
  
  const filteredMeals = dietFilter === "none" 
    ? meals 
    : filterMealsByDiet(meals, dietFilter);

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
    const dayWithoutMeal = daysOfWeek.find(day => !meals.some(m => m.day === day));
    if (dayWithoutMeal) {
      onAddMealToDay(meal, dayWithoutMeal);
    } else {
      onAddMealToDay(meal, 'Sunday');
    }
  };

  const handleMoveMeal = (meal: Meal, fromDay: string, toDay: string) => {
    const updatedMeal = { ...meal, day: toDay };
    onUpdateMeal(updatedMeal);
  };

  const handleRemoveMeal = (meal: Meal) => {
    const updatedMeal = { ...meal, day: "" };
    onUpdateMeal(updatedMeal);
  };

  const handleAddNewRecipe = (day: string) => {
    setSelectedDay(day);
    setEditingMeal(null);
    setShowAddRecipe(true);
  };

  const handleEditMealClick = (meal: Meal) => {
    console.log("Edit meal clicked:", meal.title);
    setEditingMeal(meal);
    setSelectedDay(meal.day);
    setShowAddRecipe(true);
  };

  const handleAddRecipe = async (recipeData: any) => {
    if (editingMeal) {
      // Update existing meal
      const updatedMeal: Meal = {
        ...editingMeal,
        title: recipeData.title,
        recipeUrl: recipeData.recipeUrl,
        ingredients: recipeData.ingredients,
        dietaryPreferences: Array.isArray(recipeData.dietaryPreferences) 
          ? recipeData.dietaryPreferences 
          : [recipeData.dietaryPreferences] as DietaryPreference[],
        lastUsed: new Date()
      };
      await onUpdateMeal(updatedMeal);
    } else {
      // Create completely new meal with proper UUID
      const newMeal: Meal = {
        id: uuidv4(),
        day: selectedDay,
        title: recipeData.title,
        recipeUrl: recipeData.recipeUrl,
        ingredients: recipeData.ingredients,
        dietaryPreferences: Array.isArray(recipeData.dietaryPreferences) 
          ? recipeData.dietaryPreferences 
          : [recipeData.dietaryPreferences] as DietaryPreference[],
        notes: '',
        lastUsed: new Date()
      };
      
      // Use onUpdateMeal instead of onAddMealToDay for new meals to ensure proper Supabase integration
      await onUpdateMeal(newMeal);
    }
    
    setShowAddRecipe(false);
    setEditingMeal(null);
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <section id="meal-plan" className="py-8">
        <div className="container mx-auto">
          <MealPlanHeader
            dietFilter={dietFilter}
            onDietFilterChange={setDietFilter}
            onAddRecipe={() => {
              setSelectedDay(daysOfWeek.find(day => !getMealsForDay(day).length) || 'Sunday');
              setEditingMeal(null);
              setShowAddRecipe(true);
            }}
          />

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
                onEdit={handleEditMealClick}
                onRate={handleOpenRatingDialog}
                onMove={handleMoveMeal}
                onAddMeal={handleAddNewRecipe}
                onRemove={handleRemoveMeal}
                onUpdateMeal={onUpdateMeal}
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
            onClose={() => {
              setShowAddRecipe(false);
              setEditingMeal(null);
            }}
            onAddRecipe={handleAddRecipe}
            selectedDay={selectedDay}
            onFetchIngredients={extractIngredientsFromRecipeUrl}
            editingMeal={editingMeal}
          />
        </div>
      </section>
    </DndProvider>
  );
};
