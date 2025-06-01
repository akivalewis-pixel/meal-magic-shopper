
import { useToast } from "@/hooks/use-toast";
import { Meal, WeeklyMealPlan, GroceryItem } from "@/types";
import { getCurrentWeekStart } from "@/utils";

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

  const handleAddMealToDay = (meal: Meal, day: string) => {
    const newMeal: Meal = {
      ...meal,
      id: `${meal.id}-${day}-${Date.now()}`,
      day,
      lastUsed: new Date()
    };

    setMeals(prevMeals => [...prevMeals, newMeal]);
    
    toast({
      title: "Meal Added",
      description: `${meal.title} has been added to ${day}`,
    });
  };

  const handleSaveWeeklyPlan = (
    name: string, 
    getCurrentItems?: () => GroceryItem[], 
    getAvailableStores?: () => string[]
  ) => {
    const currentShoppingList = getCurrentItems ? getCurrentItems() : [];
    const currentStores = getAvailableStores ? getAvailableStores() : [];
    
    console.log("Saving meal plan with", currentShoppingList.length, "shopping list items");
    
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
    
    if (resetShoppingList) {
      resetShoppingList();
    }
    
    const updatedMeals = plan.meals.map(meal => ({
      ...meal,
      lastUsed: new Date()
    }));
    
    setMeals(updatedMeals);
    
    if (plan.shoppingList && loadShoppingList) {
      const savedStores = plan.stores || ["Unassigned", "Supermarket", "Farmers Market", "Specialty Store"];
      loadShoppingList(plan.shoppingList, savedStores);
    }
    
    toast({
      title: "Weekly Plan Loaded",
      description: `"${plan.name}" has been loaded with ${plan.shoppingList?.length || 0} shopping list items.`,
    });
  };

  const handleDeleteWeeklyPlan = (planId: string) => {
    const planToDelete = weeklyPlans.find(plan => plan.id === planId);
    if (!planToDelete) return;

    setWeeklyPlans(weeklyPlans.filter(plan => plan.id !== planId));
    
    toast({
      title: "Weekly Plan Deleted",
      description: `"${planToDelete.name}" has been deleted.`,
    });
  };

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
    handleAddMealToDay,
    handleSaveWeeklyPlan,
    handleLoadWeeklyPlan,
    handleDeleteWeeklyPlan,
    handleResetMealPlan
  };
}
