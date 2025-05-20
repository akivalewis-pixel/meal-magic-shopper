
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { 
  Meal, 
  WeeklyMealPlan,
  GroceryItem
} from "@/types";
import { 
  getCurrentWeekStart
} from "@/utils";
import { extractIngredientsFromRecipeUrl } from "@/utils/recipeUtils";

export function useMealPlan() {
  const { toast } = useToast();
  const [meals, setMeals] = useState<Meal[]>([]);
  const [weeklyPlans, setWeeklyPlans] = useState<WeeklyMealPlan[]>([]);

  // Initialize with saved data only (no sample data)
  useEffect(() => {
    const savedMeals = localStorage.getItem('mealPlannerMeals');
    const savedWeeklyPlans = localStorage.getItem('mealPlannerWeeklyPlans');
    
    const initialMeals = savedMeals ? JSON.parse(savedMeals) : [];
    const initialWeeklyPlans = savedWeeklyPlans ? JSON.parse(savedWeeklyPlans) : [];
    
    setMeals(initialMeals);
    setWeeklyPlans(initialWeeklyPlans);
  }, []);

  // Save to localStorage when state changes
  useEffect(() => {
    localStorage.setItem('mealPlannerMeals', JSON.stringify(meals));
    localStorage.setItem('mealPlannerWeeklyPlans', JSON.stringify(weeklyPlans));
  }, [meals, weeklyPlans]);

  const handleEditMeal = (meal: Meal) => {
    toast({
      title: "Edit Meal",
      description: `You've selected to edit ${meal.title} for ${meal.day}`,
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

  const handleAddMealToDay = async (meal: Meal, day: string) => {
    // If day is empty, remove the meal from the weekly plan but keep it in the collection
    if (!day) {
      setMeals(prevMeals =>
        prevMeals.map(m =>
          m.id === meal.id
            ? { ...m, day: "" }
            : m
        )
      );
      
      toast({
        title: "Meal Removed",
        description: `${meal.title} has been removed from the meal plan`,
      });
      return;
    }
    
    // If the meal has a recipeUrl but no ingredients, try to fetch them
    let mealToAdd = { ...meal };
    if (meal.recipeUrl && (!meal.ingredients || meal.ingredients.length === 0)) {
      toast({
        title: "Fetching Ingredients",
        description: "Attempting to get ingredients from recipe URL...",
      });
      
      try {
        const recipeData = await extractIngredientsFromRecipeUrl(meal.recipeUrl);
        
        if (recipeData.ingredients.length > 0) {
          mealToAdd.ingredients = recipeData.ingredients;
          
          // If we got a title and the meal doesn't have one yet, use it
          if (recipeData.title && (!meal.title || meal.title === "New Recipe")) {
            mealToAdd.title = recipeData.title;
          }
          
          toast({
            title: "Ingredients Found",
            description: `Found ${recipeData.ingredients.length} ingredients for ${meal.title}`,
          });
        } else {
          toast({
            title: "No Ingredients Found",
            description: "Couldn't extract ingredients from the URL. Please add them manually.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error fetching ingredients:", error);
        toast({
          title: "Error",
          description: "Failed to fetch ingredients. Please add them manually.",
          variant: "destructive",
        });
      }
    }
    
    // For adding a new meal to a day (allowing multiple meals per day)
    const existingMeal = meals.find(m => m.id === meal.id);
    
    if (existingMeal) {
      // Update existing meal
      setMeals(prevMeals =>
        prevMeals.map(m =>
          m.id === meal.id
            ? { ...mealToAdd, day, lastUsed: new Date() }
            : m
        )
      );
    } else {
      // Add a completely new meal
      setMeals(prevMeals => [
        ...prevMeals,
        {
          ...mealToAdd,
          id: meal.id || `${day}-${Date.now()}`, // Use existing ID or generate new one
          day, // Set the day
          lastUsed: new Date(),
        },
      ]);
    }
    
    toast({
      title: "Meal Added",
      description: `${meal.title} has been added to ${day}`,
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
    setMeals(plan.meals.map(meal => ({
      ...meal,
      lastUsed: new Date() // Update the last used date
    })));
    
    toast({
      title: "Weekly Plan Loaded",
      description: `"${plan.name}" has been loaded.`,
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
    meals,
    weeklyPlans,
    handleEditMeal,
    handleRateMeal,
    handleAddMealToDay,
    handleSaveWeeklyPlan,
    handleLoadWeeklyPlan,
    handleResetMealPlan,
    setMeals
  };
}
