import { useToast } from "@/hooks/use-toast";
import { Meal } from "@/types";
import { extractIngredientsFromRecipeUrl } from "@/utils/recipeUtils";

interface UseMealPlanDayActionsProps {
  meals: Meal[];
  setMeals: React.Dispatch<React.SetStateAction<Meal[]>>;
}

export function useMealPlanDayActions({ meals, setMeals }: UseMealPlanDayActionsProps) {
  const { toast } = useToast();

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

  return {
    handleAddMealToDay
  };
}
