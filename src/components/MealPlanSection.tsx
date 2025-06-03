
import React, { useState } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { MealCard } from "./MealCard";
import { MealRatingDialog } from "./MealRatingDialog";
import { MealRecommendations } from "./MealRecommendations";
import { AddRecipeDialog } from "./MealPlan/AddRecipeDialog";
import { Meal, DietaryPreference } from "@/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { daysOfWeek, dietaryOptions } from "@/utils/constants";
import { filterMealsByDiet } from "@/utils/mealUtils";
import { useToast } from "@/hooks/use-toast";
import { extractIngredientsFromRecipeUrl } from "@/utils/recipeUtils";

// Function to extract ingredients from a recipe URL
const fetchIngredientsFromUrl = async (url: string): Promise<{
  title?: string;
  ingredients: string[];
  quantities?: Record<string, string>;
}> => {
  return await extractIngredientsFromRecipeUrl(url);
};

interface MealPlanSectionProps {
  meals: Meal[];
  onEditMeal: (meal: Meal) => void;
  onUpdateMeal: (updatedMeal: Meal) => void;
  onRateMeal: (meal: Meal, rating: number, notes: string) => void;
  onAddMealToDay: (meal: Meal, day: string) => void;
  onResetMealPlan: () => void;
}

// Drag item type
const ItemTypes = {
  MEAL: 'meal'
};

// Draggable meal component
const DraggableMeal = ({ meal, day, onEdit, onRate, onMove, onRemove }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.MEAL,
    item: { id: meal.id, day: day, meal: meal },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging()
    })
  }));

  return (
    <div 
      ref={drag} 
      className={`${isDragging ? 'opacity-50' : 'opacity-100'} mb-2 last:mb-0`}
    >
      <MealCard 
        meal={meal} 
        onEdit={onEdit} 
        onRate={onRate}
        onRemove={onRemove}
      />
    </div>
  );
};

// Droppable day component
const DroppableDay = ({ day, meals, onDrop, onEdit, onRate, onMove, onAddMeal, onRemove }) => {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: ItemTypes.MEAL,
    drop: (item: { id: string, day: string, meal: Meal }) => {
      onMove(item.meal, item.day, day);
      return { name: day };
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver()
    })
  }));

  return (
    <div 
      ref={drop} 
      className={`flex flex-col ${isOver ? 'bg-gray-100' : ''} h-full`}
    >
      <h3 className="mb-2 text-center font-semibold">{day}</h3>
      <div className="flex-1 flex flex-col">
        {meals && meals.length > 0 ? (
          meals.map(meal => (
            <DraggableMeal 
              key={meal.id}
              meal={meal} 
              day={day} 
              onEdit={onEdit} 
              onRate={onRate}
              onMove={onMove}
              onRemove={() => onRemove(meal)}
            />
          ))
        ) : (
          <div 
            className="meal-card flex h-full flex-col items-center justify-center p-4 text-center text-muted-foreground cursor-pointer"
            onClick={() => onAddMeal(day)}
          >
            <p className="mb-2">No meals planned</p>
            <p className="text-sm">
              Click to add a meal
            </p>
          </div>
        )}
      </div>
      <div className="mt-2 flex justify-center">
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full"
          onClick={() => onAddMeal(day)}
        >
          <Plus className="h-4 w-4 mr-1" /> Add Meal
        </Button>
      </div>
    </div>
  );
};

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
    
    // Add to the new day without removing anything from the original day
    onAddMealToDay(updatedMeal, toDay);
  };

  const handleRemoveMeal = (meal: Meal) => {
    // Create a copy of the meal with empty day to remove it
    const updatedMeal = { ...meal, day: "" };
    onAddMealToDay(updatedMeal, "");
  };

  const handleAddNewRecipe = (day: string) => {
    setSelectedDay(day);
    setEditingMeal(null);
    setShowAddRecipe(true);
  };

  // This is the function that should open the edit dialog
  const handleEditMealClick = (meal: Meal) => {
    console.log("Edit meal clicked:", meal.title);
    setEditingMeal(meal);
    setSelectedDay(meal.day);
    setShowAddRecipe(true);
  };

  const handleAddRecipe = (recipeData: any) => {
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
      onUpdateMeal(updatedMeal);
      
      toast({
        title: "Meal Updated",
        description: `${updatedMeal.title} has been updated`,
      });
    } else {
      // Add new meal
      const newMeal: Meal = {
        id: `${selectedDay}-${Date.now()}`,
        day: selectedDay,
        title: recipeData.title,
        recipeUrl: recipeData.recipeUrl,
        ingredients: recipeData.ingredients,
        dietaryPreferences: Array.isArray(recipeData.dietaryPreferences) 
          ? recipeData.dietaryPreferences 
          : [recipeData.dietaryPreferences] as DietaryPreference[],
        lastUsed: new Date()
      };
      
      onAddMealToDay(newMeal, selectedDay);
      
      toast({
        title: "Meal Added",
        description: `${newMeal.title} has been added to ${selectedDay}`,
      });
    }
    
    setShowAddRecipe(false);
    setEditingMeal(null);
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
              setEditingMeal(null);
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
                onEdit={handleEditMealClick}
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

          {/* Add/Edit Recipe Dialog */}
          <AddRecipeDialog
            isOpen={showAddRecipe}
            onClose={() => {
              setShowAddRecipe(false);
              setEditingMeal(null);
            }}
            onAddRecipe={handleAddRecipe}
            selectedDay={selectedDay}
            onFetchIngredients={fetchIngredientsFromUrl}
            editingMeal={editingMeal}
          />
        </div>
      </section>
    </DndProvider>
  );
};
