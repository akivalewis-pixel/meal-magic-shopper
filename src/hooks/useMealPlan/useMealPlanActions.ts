
import { useToast } from "@/hooks/use-toast";
import { Meal, WeeklyMealPlan, GroceryItem } from "@/types";
import { getCurrentWeekStart } from "@/utils";
import { extractIngredientsFromRecipeUrl } from "@/utils/recipeUtils";

interface UseMealPlanActionsProps {
  meals: Meal[];
  weeklyPlans: WeeklyMealPlan[];
  setMeals: React.Dispatch<React.SetStateAction<Meal[]>>;
  setWeeklyPlans: React.Dispatch<React.SetStateAction<WeeklyMealPlan[]>>;
}

export function useMealPlanActions({ 
  meals, 
  weeklyPlans, 
  setMeals, 
  setWeeklyPlans
}: UseMealPlanActionsProps) {
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

  const handleSaveWeeklyPlan = (
    name: string, 
    getCurrentItems?: () => GroceryItem[], 
    getAvailableStores?: () => string[]
  ) => {
    // Get current shopping list and stores if available
    const currentShoppingList = getCurrentItems ? getCurrentItems() : [];
    const currentStores = getAvailableStores ? getAvailableStores() : [];
    
    console.log("Saving meal plan with", currentShoppingList.length, "shopping list items");
    console.log("Shopping list items:", currentShoppingList.map(item => ({ 
      name: item.name, 
      store: item.store, 
      category: item.category,
      checked: item.checked 
    })));
    
    // Create a new weekly plan with the current meals and shopping list
    const newPlan: WeeklyMealPlan = {
      id: Date.now().toString(),
      name,
      weekStartDate: getCurrentWeekStart(),
      meals: [...meals],
      shoppingList: currentShoppingList,
      stores: currentStores
    };
    
    setWeeklyPlans([...weeklyPlans, newPlan]);
    
    toast({
      title: "Weekly Plan Saved",
      description: `"${name}" has been saved with ${currentShoppingList.length} shopping list items.`,
    });
  };

  const handleLoadWeeklyPlan = (
    plan: WeeklyMealPlan,
    resetShoppingList?: () => void,
    loadShoppingList?: (items: GroceryItem[], stores: string[]) => void
  ) => {
    console.log("Loading meal plan:", plan.name);
    console.log("Plan has", plan.meals.length, "meals");
    console.log("Plan has", plan.shoppingList?.length || 0, "shopping list items");
    
    // First reset the current shopping list
    if (resetShoppingList) {
      console.log("Resetting current shopping list");
      resetShoppingList();
    }
    
    // Replace current meals with the selected plan
    const updatedMeals = plan.meals.map(meal => ({
      ...meal,
      lastUsed: new Date() // Update the last used date
    }));
    
    setMeals(updatedMeals);
    
    // Load the saved shopping list if it exists
    if (plan.shoppingList && loadShoppingList) {
      console.log("Loading saved shopping list with", plan.shoppingList.length, "items");
      const savedStores = plan.stores || ["Unassigned", "Supermarket", "Farmers Market", "Specialty Store"];
      loadShoppingList(plan.shoppingList, savedStores);
    }
    
    toast({
      title: "Weekly Plan Loaded",
      description: `"${plan.name}" has been loaded with ${plan.shoppingList?.length || 0} shopping list items.`,
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
