import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Meal, WeeklyMealPlan, GroceryItem, DietaryPreference } from '@/types';
import { getCurrentWeekStart } from '@/utils';
import { logger } from '@/utils/logger';

export function useSupabaseMealPlan() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [meals, setMeals] = useState<Meal[]>([]);
  const [weeklyPlans, setWeeklyPlans] = useState<WeeklyMealPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Load meals from Supabase
  const loadMeals = async () => {
    if (!user) return;

    try {
      setError(null);
      const { data, error: queryError } = await supabase
        .from('meals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (queryError) throw queryError;

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
    } catch (err) {
      setError(err as Error);
      logger.error('Error loading meals:', err);
      toast({
        title: "Error",
        description: "Failed to load meals. Click retry to try again.",
        variant: "destructive",
      });
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
        logger.error('Error loading weekly plans:', plansError);
        return;
      }

      // Load all plan meals in a single query (no N+1)
      const planIds = plansData.map(p => p.id);
      const { data: allPlanMeals, error: planMealsError } = await supabase
        .from('weekly_plan_meals')
        .select('*')
        .in('plan_id', planIds);

      if (planMealsError) {
        logger.error('Error loading plan meals:', planMealsError);
        return;
      }

      // Group plan meals by plan_id
      const mealsByPlan = new Map<string, typeof allPlanMeals>();
      allPlanMeals?.forEach(meal => {
        const existing = mealsByPlan.get(meal.plan_id) || [];
        existing.push(meal);
        mealsByPlan.set(meal.plan_id, existing);
      });

      const formattedPlans: WeeklyMealPlan[] = plansData.map(plan => {
        const planMeals = mealsByPlan.get(plan.id) || [];
        const formattedPlanMeals: Meal[] = planMeals.map(meal => ({
          id: meal.meal_id || meal.id,
          day: meal.day || '',
          title: meal.title,
          recipeUrl: meal.recipe_url || '',
          ingredients: Array.isArray(meal.ingredients) ? meal.ingredients : [],
          dietaryPreferences: (Array.isArray(meal.dietary_preferences) ? meal.dietary_preferences : []) as DietaryPreference[],
          notes: meal.notes || '',
          rating: meal.rating || undefined,
          lastUsed: undefined
        }));

        return {
          id: plan.id,
          name: plan.name,
          weekStartDate: plan.week_start_date,
          meals: formattedPlanMeals,
          shoppingList: [],
          stores: []
        };
      });

      setWeeklyPlans(formattedPlans);
    } catch (error) {
      logger.error('Error loading weekly plans:', error);
    }
  };

  // Retry function
  const retry = () => {
    setError(null);
    setLoading(true);
    Promise.all([loadMeals(), loadWeeklyPlans()]).finally(() => {
      setLoading(false);
    });
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
        logger.error('Error saving meal:', error);
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
          const updatedMeals = [...prevMeals];
          updatedMeals[existingIndex] = meal;
          return updatedMeals;
        } else {
          return [...prevMeals, meal];
        }
      });
      
      toast({
        title: "Meal Saved",
        description: `${meal.title} has been saved successfully`,
      });
    } catch (error) {
      logger.error('Error updating meal:', error);
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
        logger.error('Error saving weekly plan:', planError);
        toast({
          title: "Error",
          description: "Failed to save weekly plan",
          variant: "destructive",
        });
        return;
      }

      const currentMealsWithDays = meals.filter(meal => meal.day && meal.day !== '');
      
      if (currentMealsWithDays.length > 0) {
        const planMealRows = currentMealsWithDays.map(meal => ({
          user_id: user.id,
          plan_id: planData.id,
          meal_id: meal.id,
          title: meal.title,
          day: meal.day,
          recipe_url: meal.recipeUrl || null,
          ingredients: meal.ingredients || [],
          dietary_preferences: meal.dietaryPreferences || [],
          notes: meal.notes || null,
          rating: meal.rating || null,
        }));

        const { error: mealsError } = await supabase
          .from('weekly_plan_meals')
          .insert(planMealRows);

        if (mealsError) {
          logger.error('Error saving plan meals snapshot:', mealsError);
        }
      }

      const currentShoppingList = getCurrentItems ? getCurrentItems() : [];
      const currentStores = getAvailableStores ? getAvailableStores() : [];

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
      logger.error('Error saving weekly plan:', error);
    }
  };

  // Load weekly plan - properly restore meals to current plan
  const handleLoadWeeklyPlan = async (plan: WeeklyMealPlan) => {
    if (!user) return;

    try {
      const currentMeals = meals.map(meal => ({ ...meal, day: '' }));
      
      for (const meal of currentMeals) {
        await handleUpdateMeal(meal);
      }

      for (const planMeal of plan.meals) {
        await handleUpdateMeal({
          ...planMeal,
          lastUsed: new Date()
        });
      }

      await loadMeals();
      
      toast({
        title: "Weekly Plan Loaded",
        description: `"${plan.name}" has been loaded with ${plan.meals.length} meals.`,
      });
    } catch (error) {
      logger.error('Error loading weekly plan:', error);
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
        logger.error('Error deleting weekly plan:', error);
        toast({
          title: "Error",
          description: "Failed to delete weekly plan",
          variant: "destructive",
        });
        return;
      }

      setWeeklyPlans(prev => prev.filter(plan => plan.id !== planId));
      
      toast({
        title: "Weekly Plan Deleted",
        description: "The weekly plan has been deleted.",
      });
    } catch (error) {
      logger.error('Error deleting weekly plan:', error);
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
        logger.error('Error resetting meal plan:', error);
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
      logger.error('Error resetting meal plan:', error);
    }
  };

  return {
    meals,
    weeklyPlans,
    loading,
    error,
    retry,
    handleUpdateMeal,
    handleAddMealToDay,
    handleRateMeal,
    handleSaveWeeklyPlan,
    handleDeleteWeeklyPlan,
    handleResetMealPlan,
    handleLoadWeeklyPlan,
    handleEditMeal: (meal: Meal) => {
      toast({
        title: "Edit Meal",
        description: `You've selected to edit ${meal.title} for ${meal.day}`,
      });
    }
  };
}
