import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Meal, WeeklyMealPlan, GroceryItem } from '@/types';
import { getCurrentWeekStart } from '@/utils';

export function useSupabaseMealPlan() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [meals, setMeals] = useState<Meal[]>([]);
  const [weeklyPlans, setWeeklyPlans] = useState<WeeklyMealPlan[]>([]);
  const [loading, setLoading] = useState(true);

  // Load meals from Supabase
  const loadMeals = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('meals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading meals:', error);
        toast({
          title: "Error",
          description: "Failed to load meals",
          variant: "destructive",
        });
        return;
      }

      const formattedMeals: Meal[] = data.map(meal => ({
        id: meal.id,
        day: meal.day || '',
        title: meal.title,
        recipeUrl: meal.recipe_url || '',
        ingredients: Array.isArray(meal.ingredients) ? meal.ingredients.filter((item): item is string => typeof item === 'string') : [],
        dietaryPreferences: Array.isArray(meal.dietary_preferences) ? meal.dietary_preferences.filter((item): item is any => typeof item === 'string') : [],
        notes: meal.notes || '',
        rating: meal.rating || undefined,
        lastUsed: meal.last_used ? new Date(meal.last_used) : undefined
      }));

      setMeals(formattedMeals);
    } catch (error) {
      console.error('Error loading meals:', error);
    }
  };

  // Load weekly plans from Supabase with associated meals
  const loadWeeklyPlans = async () => {
    if (!user) return;

    try {
      const { data: plansData, error: plansError } = await supabase
        .from('weekly_meal_plans')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (plansError) {
        console.error('Error loading weekly plans:', plansError);
        return;
      }

      // For each plan, load the meals that were active during that week
      const formattedPlans: WeeklyMealPlan[] = [];
      
      for (const plan of plansData) {
        // Get meals that were created/updated around the time of this plan
        // We'll use a simple approach: get meals that have a day assigned
        // In a more sophisticated system, we'd have a meal_plan_meals junction table
        const { data: planMeals, error: mealsError } = await supabase
          .from('meals')
          .select('*')
          .eq('user_id', user.id)
          .not('day', 'is', null)
          .not('day', 'eq', '');

        if (mealsError) {
          console.error('Error loading plan meals:', mealsError);
          continue;
        }

        const formattedPlanMeals: Meal[] = planMeals.map(meal => ({
          id: meal.id,
          day: meal.day || '',
          title: meal.title,
          recipeUrl: meal.recipe_url || '',
          ingredients: Array.isArray(meal.ingredients) ? meal.ingredients.filter((item): item is string => typeof item === 'string') : [],
          dietaryPreferences: Array.isArray(meal.dietary_preferences) ? meal.dietary_preferences.filter((item): item is any => typeof item === 'string') : [],
          notes: meal.notes || '',
          rating: meal.rating || undefined,
          lastUsed: meal.last_used ? new Date(meal.last_used) : undefined
        }));

        formattedPlans.push({
          id: plan.id,
          name: plan.name,
          weekStartDate: plan.week_start_date,
          meals: formattedPlanMeals,
          shoppingList: [],
          stores: []
        });
      }

      setWeeklyPlans(formattedPlans);
    } catch (error) {
      console.error('Error loading weekly plans:', error);
    }
  };

  // Initial load
  useEffect(() => {
    if (user) {
      Promise.all([loadMeals(), loadWeeklyPlans()]).finally(() => {
        setLoading(false);
      });
    }
  }, [user]);

  // Add or update meal - now handles both create and update operations
  const handleUpdateMeal = async (meal: Meal) => {
    if (!user) return;

    try {
      const mealData = {
        user_id: user.id,
        title: meal.title,
        day: meal.day,
        recipe_url: meal.recipeUrl || null,
        ingredients: meal.ingredients,
        dietary_preferences: meal.dietaryPreferences,
        notes: meal.notes || null,
        rating: meal.rating || null,
        last_used: meal.lastUsed ? meal.lastUsed.toISOString() : null
      };

      const { error } = await supabase
        .from('meals')
        .upsert({ id: meal.id, ...mealData });

      if (error) {
        console.error('Error saving meal:', error);
        toast({
          title: "Error",
          description: "Failed to save meal",
          variant: "destructive",
        });
        return;
      }

      // Immediately update local state for instant UI feedback
      setMeals(prevMeals => {
        const existingIndex = prevMeals.findIndex(m => m.id === meal.id);
        if (existingIndex >= 0) {
          // Update existing meal
          const updatedMeals = [...prevMeals];
          updatedMeals[existingIndex] = meal;
          return updatedMeals;
        } else {
          // Add new meal
          return [...prevMeals, meal];
        }
      });
      
      toast({
        title: "Meal Saved",
        description: `${meal.title} has been saved successfully`,
      });
    } catch (error) {
      console.error('Error updating meal:', error);
      toast({
        title: "Error",
        description: "Failed to save meal",
        variant: "destructive",
      });
    }
  };

  // Add meal to day
  const handleAddMealToDay = async (meal: Meal, day: string) => {
    if (!user) return;

    const updatedMeal = {
      ...meal,
      day,
      lastUsed: new Date()
    };

    await handleUpdateMeal(updatedMeal);
  };

  // Rate meal
  const handleRateMeal = async (meal: Meal, rating: number, notes: string) => {
    const updatedMeal = {
      ...meal,
      rating,
      notes,
      lastUsed: new Date()
    };

    await handleUpdateMeal(updatedMeal);
    
    toast({
      title: "Meal Rated",
      description: `You've rated ${meal.title} ${rating}/5 stars`,
    });
  };

  // Save weekly plan - now properly captures current meals
  const handleSaveWeeklyPlan = async (
    name: string,
    getCurrentItems?: () => GroceryItem[],
    getAvailableStores?: () => string[]
  ) => {
    if (!user) return;

    try {
      const currentWeekStart = getCurrentWeekStart();
      
      // Save the weekly plan metadata
      const { data: planData, error: planError } = await supabase
        .from('weekly_meal_plans')
        .insert({
          user_id: user.id,
          name,
          week_start_date: currentWeekStart
        })
        .select()
        .single();

      if (planError) {
        console.error('Error saving weekly plan:', planError);
        toast({
          title: "Error",
          description: "Failed to save weekly plan",
          variant: "destructive",
        });
        return;
      }

      // Create a snapshot of the current meal plan
      const currentMealsWithDays = meals.filter(meal => meal.day && meal.day !== '');
      const currentShoppingList = getCurrentItems ? getCurrentItems() : [];
      const currentStores = getAvailableStores ? getAvailableStores() : [];

      // Add the new plan to local state immediately
      const newPlan: WeeklyMealPlan = {
        id: planData.id,
        name,
        weekStartDate: currentWeekStart,
        meals: [...currentMealsWithDays],
        shoppingList: currentShoppingList,
        stores: currentStores
      };

      setWeeklyPlans(prev => [newPlan, ...prev]);
      
      toast({
        title: "Weekly Plan Saved",
        description: `"${name}" has been saved with ${currentMealsWithDays.length} meals.`,
      });
    } catch (error) {
      console.error('Error saving weekly plan:', error);
    }
  };

  // Load weekly plan - properly restore meals to current plan
  const handleLoadWeeklyPlan = async (plan: WeeklyMealPlan) => {
    if (!user) return;

    try {
      // First, clear current meal days
      const currentMeals = meals.map(meal => ({ ...meal, day: '' }));
      
      // Update all meals to clear their days first
      for (const meal of currentMeals) {
        await handleUpdateMeal(meal);
      }

      // Then load the meals from the plan
      for (const planMeal of plan.meals) {
        await handleUpdateMeal({
          ...planMeal,
          lastUsed: new Date()
        });
      }

      // Reload meals to get the updated state
      await loadMeals();
      
      toast({
        title: "Weekly Plan Loaded",
        description: `"${plan.name}" has been loaded with ${plan.meals.length} meals.`,
      });
    } catch (error) {
      console.error('Error loading weekly plan:', error);
      toast({
        title: "Error",
        description: "Failed to load weekly plan",
        variant: "destructive",
      });
    }
  };

  // Delete weekly plan
  const handleDeleteWeeklyPlan = async (planId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('weekly_meal_plans')
        .delete()
        .eq('id', planId);

      if (error) {
        console.error('Error deleting weekly plan:', error);
        toast({
          title: "Error",
          description: "Failed to delete weekly plan",
          variant: "destructive",
        });
        return;
      }

      // Remove from local state
      setWeeklyPlans(prev => prev.filter(plan => plan.id !== planId));
      
      toast({
        title: "Weekly Plan Deleted",
        description: "The weekly plan has been deleted.",
      });
    } catch (error) {
      console.error('Error deleting weekly plan:', error);
    }
  };

  // Reset meal plan
  const handleResetMealPlan = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('meals')
        .update({ day: null })
        .eq('user_id', user.id);

      if (error) {
        console.error('Error resetting meal plan:', error);
        toast({
          title: "Error",
          description: "Failed to reset meal plan",
          variant: "destructive",
        });
        return;
      }

      await loadMeals();
      
      toast({
        title: "Meal Plan Reset",
        description: "Your meal plan has been reset. Start fresh!",
      });
    } catch (error) {
      console.error('Error resetting meal plan:', error);
    }
  };

  return {
    meals,
    weeklyPlans,
    loading,
    handleUpdateMeal,
    handleAddMealToDay,
    handleRateMeal,
    handleSaveWeeklyPlan,
    handleDeleteWeeklyPlan,
    handleResetMealPlan,
    handleLoadWeeklyPlan,
    // Keep these for backward compatibility
    handleEditMeal: (meal: Meal) => {
      toast({
        title: "Edit Meal",
        description: `You've selected to edit ${meal.title} for ${meal.day}`,
      });
    }
  };
}
