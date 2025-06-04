// Meal-related utility functions
import { Meal, DietaryPreference, WeeklyMealPlan } from "@/types";
import { daysOfWeek } from "./constants";

/**
 * Generate a placeholder meal plan for demo purposes
 */
export const generateSampleMealPlan = (): Meal[] => {
  return [
    {
      id: '1',
      day: 'Sunday',
      title: 'Spaghetti and Meatballs',
      recipeUrl: 'https://www.allrecipes.com/recipe/21353/spaghetti-and-meatballs/',
      ingredients: ['1 lb spaghetti', '1 lb ground beef', '1 jar marinara sauce', '1 onion', '2 cloves garlic', 'parmesan cheese'],
      dietaryPreferences: ['none'],
      notes: 'Kids favorite!'
    },
    {
      id: '2',
      day: 'Monday',
      title: 'Vegetable Stir Fry',
      recipeUrl: 'https://www.allrecipes.com/recipe/223382/vegetable-stir-fry/',
      ingredients: ['2 cups rice', 'broccoli', 'carrots', 'bell peppers', 'soy sauce', 'garlic', 'ginger'],
      dietaryPreferences: ['vegetarian', 'vegan', 'dairy-free'],
      notes: 'Use tamari for gluten-free option'
    },
    {
      id: '3',
      day: 'Tuesday',
      title: 'Grilled Chicken with Roasted Vegetables',
      recipeUrl: 'https://www.allrecipes.com/recipe/228446/grilled-chicken/',
      ingredients: ['4 chicken breasts', 'zucchini', 'yellow squash', 'red onion', 'olive oil', 'rosemary', 'thyme'],
      dietaryPreferences: ['gluten-free', 'dairy-free'],
      notes: ''
    },
    {
      id: '4',
      day: 'Wednesday',
      title: 'Kosher Beef Brisket',
      recipeUrl: 'https://www.allrecipes.com/recipe/241293/kosher-beef-brisket/',
      ingredients: ['3 lb beef brisket', 'onions', 'carrots', 'celery', 'beef broth', 'kosher salt', 'pepper'],
      dietaryPreferences: ['kosher', 'gluten-free', 'dairy-free'],
      notes: 'Slow cooker recipe'
    },
    {
      id: '5',
      day: 'Thursday',
      title: 'Mediterranean Salad',
      recipeUrl: 'https://www.allrecipes.com/recipe/16110/mediterranean-salad/',
      ingredients: ['romaine lettuce', 'cucumber', 'tomatoes', 'red onion', 'feta cheese', 'kalamata olives', 'olive oil', 'lemon juice'],
      dietaryPreferences: ['vegetarian', 'gluten-free'],
      notes: 'Skip the feta for vegan option'
    },
    {
      id: '6',
      day: 'Friday',
      title: 'Fish Tacos',
      recipeUrl: 'https://www.allrecipes.com/recipe/53729/fish-tacos/',
      ingredients: ['white fish fillets', 'cabbage', 'lime', 'corn tortillas', 'avocado', 'cilantro', 'sour cream'],
      dietaryPreferences: ['gluten-free'],
      notes: 'Use gluten-free tortillas'
    },
    {
      id: '7',
      day: 'Saturday',
      title: 'Homemade Pizza',
      recipeUrl: 'https://www.allrecipes.com/recipe/240376/homemade-pizza/',
      ingredients: ['pizza dough', 'tomato sauce', 'mozzarella cheese', 'pepperoni', 'mushrooms', 'bell peppers', 'olive oil'],
      dietaryPreferences: ['none'],
      notes: 'Make half vegetarian for Emma'
    }
  ];
};

/**
 * Filter meals by dietary preference
 */
export const filterMealsByDiet = (meals: Meal[], dietPreference: DietaryPreference): Meal[] => {
  if (dietPreference === 'none') {
    return meals;
  }
  return meals.filter(meal => meal.dietaryPreferences.includes(dietPreference));
};

/**
 * Search meals across all saved weekly plans
 */
export const searchMealsByTitle = (weeklyPlans: WeeklyMealPlan[], searchTerm: string): Meal[] => {
  if (!searchTerm) return [];
  
  const allMeals: Meal[] = [];
  weeklyPlans.forEach(plan => {
    plan.meals
      .filter(meal => meal.title.toLowerCase().includes(searchTerm.toLowerCase()))
      .forEach(meal => {
        allMeals.push({
          ...meal,
          weekId: plan.id
        });
      });
  });
  
  return allMeals.sort((a, b) => {
    if (a.lastUsed && b.lastUsed) {
      return new Date(b.lastUsed).getTime() - new Date(a.lastUsed).getTime();
    }
    return 0;
  });
};

/**
 * Search meals by rating or notes
 */
export const searchMealsByRating = (weeklyPlans: WeeklyMealPlan[], searchTerm: string): Meal[] => {
  if (!searchTerm) return [];
  
  const allMeals: Meal[] = [];
  const searchTermLower = searchTerm.toLowerCase();
  
  weeklyPlans.forEach(plan => {
    plan.meals
      .filter(meal => {
        // Check if searchTerm is a number (rating search)
        const ratingSearch = /^\d+$/.test(searchTerm);
        if (ratingSearch) {
          const targetRating = parseInt(searchTerm);
          return meal.rating === targetRating;
        }
        
        // Otherwise search in notes
        return meal.notes && meal.notes.toLowerCase().includes(searchTermLower);
      })
      .forEach(meal => {
        allMeals.push({
          ...meal,
          weekId: plan.id
        });
      });
  });
  
  return allMeals.sort((a, b) => {
    // Sort by rating first (highest to lowest), then by last used date
    if (a.rating && b.rating) {
      if (a.rating !== b.rating) {
        return b.rating - a.rating;
      }
    }
    
    if (a.lastUsed && b.lastUsed) {
      return new Date(b.lastUsed).getTime() - new Date(a.lastUsed).getTime();
    }
    return 0;
  });
};

/**
 * Count how many times a meal has been used
 */
export const countMealUsage = (weeklyPlans: WeeklyMealPlan[], mealTitle: string): number => {
  return weeklyPlans.reduce((count, plan) => {
    return count + plan.meals.filter(meal => meal.title === mealTitle).length;
  }, 0);
};
