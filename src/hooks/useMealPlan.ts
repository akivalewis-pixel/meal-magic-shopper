
import { useMealPlanState } from "./useMealPlan/useMealPlanState";
import { useMealPlanActions } from "./useMealPlan/useMealPlanActions";
import { useMealPlanDayActions } from "./useMealPlan/useMealPlanDayActions";

export function useMealPlan() {
  const {
    meals,
    weeklyPlans,
    setMeals,
    setWeeklyPlans
  } = useMealPlanState();

  const actions = useMealPlanActions({ meals, weeklyPlans, setMeals, setWeeklyPlans });
  const dayActions = useMealPlanDayActions({ meals, setMeals });

  return {
    meals,
    weeklyPlans,
    setMeals,
    ...actions,
    ...dayActions
  };
}
