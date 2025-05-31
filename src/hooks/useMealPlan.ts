
import { useMealPlanState } from "./useMealPlan/useMealPlanState";
import { useMealPlanActions } from "./useMealPlan/useMealPlanActions";
import { useMealPlanDayActions } from "./useMealPlan/useMealPlanDayActions";
import { GroceryItem } from "@/types";

interface UseMealPlanProps {
  getCurrentItems?: () => GroceryItem[];
  getAvailableStores?: () => string[];
  resetShoppingList?: () => void;
  loadShoppingList?: (items: GroceryItem[], stores: string[]) => void;
}

export function useMealPlan(shoppingListProps?: UseMealPlanProps) {
  const {
    meals,
    weeklyPlans,
    setMeals,
    setWeeklyPlans
  } = useMealPlanState();

  const actions = useMealPlanActions({ 
    meals, 
    weeklyPlans, 
    setMeals, 
    setWeeklyPlans,
    ...shoppingListProps
  });
  
  const dayActions = useMealPlanDayActions({ meals, setMeals });

  return {
    meals,
    weeklyPlans,
    setMeals,
    ...actions,
    ...dayActions
  };
}
