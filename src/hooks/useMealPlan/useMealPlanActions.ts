import { useToast } from "@/hooks/use-toast";
import { Meal, WeeklyMealPlan } from "@/types";
import { getCurrentWeekStart } from "@/utils";
import { extractIngredientsFromRecipeUrl } from "@/utils/recipeUtils";

interface UseMealPlanActionsProps {
  meals: Meal[];
  weeklyPlans: WeeklyMealPlan[];
  setMeals: React.Dispatch<React.SetStateAction<Meal[]>>;
  setWeeklyPlans: React.Dispatch<React.SetStateAction<WeeklyMealPlan[]>>;
}

export function useMealPlanActions({ meals, weeklyPlans, setMeals, setWeeklyPlans }: UseMealPlanActionsProps) {
  const { toast } = useToast();

  const handleEditMeal = (meal: Meal) => {
    toast({
      title: "Edit Meal",
      description: `You've selected to edit ${meal.title} for ${meal.day}`,
    });
  };

  const handleUpdateMeal = (updatedMeal: Meal) => {
    setMeals(prevMeals => 
      prevMeals.map(m => 
        m.id === updatedMeal.id 
          ? { ...updatedMeal, lastUsed: new Date() }
          : m
      )
    );
    
    toast({
      title: "Meal Updated",
      description: `${updatedMeal.title} has been updated`,
    });
  };

  const handleRateMeal = (meal: Meal, rating: number, notes: string) => {
    setMeals(prevMeals => 
      prevMeals.map(m => 
        m.id === meal.id 
          ? { ...m, rating, notes, lastUsed: new Date() }
          : m
      )
    );
    
    toast({
      title: "Meal Rated",
      description: `You've rated ${meal.title} ${rating}/5 stars`,
    });
  };

  const handleSaveWeeklyPlan = (name: string) => {
    // Create a new weekly plan with the current meals
    const newPlan: WeeklyMealPlan = {
      id: Date.now().toString(),
      name,
      weekStartDate: getCurrentWeekStart(),
      meals: [...meals]
    };
    
    setWeeklyPlans([...weeklyPlans, newPlan]);
    
    toast({
      title: "Weekly Plan Saved",
      description: `"${name}" has been saved for future reference.`,
    });
  };

  const handleLoadWeeklyPlan = (plan: WeeklyMealPlan) => {
    // Replace current meals with the selected plan
    const updatedMeals = plan.meals.map(meal => ({
      ...meal,
      lastUsed: new Date() // Update the last used date
    }));
    
    setMeals(updatedMeals);
    
    // Force a shopping list regeneration by triggering a state change
    // The shopping list will automatically update based on the new meals
    console.log("Loading meal plan with", updatedMeals.length, "meals");
    console.log("Meals being loaded:", updatedMeals.map(m => ({ title: m.title, day: m.day, ingredients: m.ingredients.length })));
    
    toast({
      title: "Weekly Plan Loaded",
      description: `"${plan.name}" has been loaded with updated shopping list.`,
    });
  };

  // New function to reset the meal plan
  const handleResetMealPlan = () => {
    setMeals([]);
    
    toast({
      title: "Meal Plan Reset",
      description: "Your meal plan has been reset. Start fresh!",
    });
  };

  return {
    handleEditMeal,
    handleUpdateMeal,
    handleRateMeal,
    handleSaveWeeklyPlan,
    handleLoadWeeklyPlan,
    handleResetMealPlan
  };
}
