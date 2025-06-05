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
        ingredients: Array.isArray(meal.ingredients) ? meal.ingredients : [],
        dietaryPreferences: Array.isArray(meal.dietary_preferences) ? meal.dietary_preferences : [],
        notes: meal.notes || '',
        rating: meal.rating || undefined,
        lastUsed: meal.last_used ? new Date(meal.last_used) : undefined
      }));

      setMeals(formattedMeals);
    } catch (error) {
      console.error('Error loading meals:', error);
    }
  };

  // Load weekly plans from Supabase
  const loadWeeklyPlans = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('weekly_meal_plans')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading weekly plans:', error);
        return;
      }

      const formattedPlans: WeeklyMealPlan[] = data.map(plan => ({
        id: plan.id,
        name: plan.name,
        weekStartDate: plan.week_start_date,
        meals: [], // We'll load meals separately
        shoppingList: [],
        stores: []
      }));

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

  // Add or update meal
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

      await loadMeals();
      
      toast({
        title: "Meal Updated",
        description: `${meal.title} has been updated`,
      });
    } catch (error) {
      console.error('Error updating meal:', error);
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
    
    toast({
      title: "Meal Added",
      description: `${meal.title} has been added to ${day}`,
    });
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

  // Save weekly plan
  const handleSaveWeeklyPlan = async (
    name: string,
    getCurrentItems?: () => GroceryItem[],
    getAvailableStores?: () => string[]
  ) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('weekly_meal_plans')
        .insert({
          user_id: user.id,
          name,
          week_start_date: getCurrentWeekStart()
        });

      if (error) {
        console.error('Error saving weekly plan:', error);
        toast({
          title: "Error",
          description: "Failed to save weekly plan",
          variant: "destructive",
        });
        return;
      }

      await loadWeeklyPlans();
      
      toast({
        title: "Weekly Plan Saved",
        description: `"${name}" has been saved.`,
      });
    } catch (error) {
      console.error('Error saving weekly plan:', error);
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

      await loadWeeklyPlans();
      
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
    // Keep these for backward compatibility
    handleEditMeal: (meal: Meal) => {
      toast({
        title: "Edit Meal",
        description: `You've selected to edit ${meal.title} for ${meal.day}`,
      });
    },
    handleLoadWeeklyPlan: async (plan: WeeklyMealPlan) => {
      toast({
        title: "Weekly Plan Loaded",
        description: `"${plan.name}" has been loaded.`,
      });
    }
  };
}
