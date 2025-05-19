
// Date-related utility functions
import { WeeklyMealPlan } from "@/types";

/**
 * Get an ISO string for the start of the current week (Sunday)
 */
export const getCurrentWeekStart = (): string => {
  const today = new Date();
  const day = today.getDay(); // 0 for Sunday, 1 for Monday, etc.
  const diff = today.getDate() - day;
  const startOfWeek = new Date(today.setDate(diff));
  startOfWeek.setHours(0, 0, 0, 0);
  return startOfWeek.toISOString();
};

/**
 * Format a date to show as week range (e.g., "Feb 2 - Feb 8, 2025")
 */
export const formatWeekRange = (weekStartISO: string): string => {
  const weekStart = new Date(weekStartISO);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);
  
  const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
  const yearOptions: Intl.DateTimeFormatOptions = { year: 'numeric' };
  
  const startStr = weekStart.toLocaleDateString('en-US', options);
  const endStr = weekEnd.toLocaleDateString('en-US', options);
  const yearStr = weekEnd.toLocaleDateString('en-US', yearOptions);
  
  return `${startStr} - ${endStr}, ${yearStr}`;
};

/**
 * Convert ISO week start to a more readable format
 */
export const formatWeekStartDate = (isoString: string): string => {
  const date = new Date(isoString);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
};

/**
 * Find the most recent use of a meal
 */
export const findLastUsedDate = (weeklyPlans: WeeklyMealPlan[], mealTitle: string): Date | null => {
  let lastUsed: Date | null = null;
  
  for (const plan of weeklyPlans) {
    for (const meal of plan.meals) {
      if (meal.title === mealTitle && meal.lastUsed) {
        const mealDate = new Date(meal.lastUsed);
        if (!lastUsed || mealDate > lastUsed) {
          lastUsed = mealDate;
        }
      }
    }
  }
  
  return lastUsed;
};
