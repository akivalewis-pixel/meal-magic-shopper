
import { useState, useEffect } from "react";
import { Meal, WeeklyMealPlan } from "@/types";

export function useMealPlanState() {
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

  return {
    meals,
    weeklyPlans,
    setMeals,
    setWeeklyPlans
  };
}
