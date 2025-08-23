import { Meal, GroceryItem } from "@/types";
import { daysOfWeek } from "@/utils/constants";

export const generateWeeklyMealPlanContent = (meals: Meal[]): string => {
  let content = "WEEKLY MEAL PLAN\n";
  content += "====================\n\n";
  
  daysOfWeek.forEach(day => {
    const dayMeals = meals.filter(m => m.day === day);
    content += `${day.toUpperCase()}\n`;
    
    if (dayMeals.length > 0) {
      dayMeals.forEach(meal => {
        content += `• ${meal.title}`;
        if (meal.recipeUrl) {
          content += ` (${meal.recipeUrl})`;
        }
        content += "\n";
      });
    } else {
      content += "• No meal planned\n";
    }
    content += "\n";
  });
  
  return content;
};

export const generateDailyPlanContent = (day: string, meals: Meal[]): string => {
  let content = `${day.toUpperCase()} MEAL PLAN\n`;
  content += "===============\n\n";
  
  if (meals.length > 0) {
    meals.forEach(meal => {
      content += `• ${meal.title}`;
      if (meal.recipeUrl) {
        content += `\n  Recipe: ${meal.recipeUrl}`;
      }
      if (meal.ingredients && meal.ingredients.length > 0) {
        content += `\n  Ingredients: ${meal.ingredients.join(", ")}`;
      }
      content += "\n\n";
    });
  } else {
    content += "No meals planned for this day.\n";
  }
  
  return content;
};

export const generateRecipeContent = (meal: Meal): string => {
  let content = `RECIPE: ${meal.title.toUpperCase()}\n`;
  content += "=".repeat(meal.title.length + 8) + "\n\n";
  
  if (meal.recipeUrl) {
    content += `Recipe URL: ${meal.recipeUrl}\n\n`;
  }
  
  if (meal.ingredients && meal.ingredients.length > 0) {
    content += "INGREDIENTS:\n";
    meal.ingredients.forEach(ingredient => {
      content += `• ${ingredient}\n`;
    });
    content += "\n";
  }
  
  if (meal.dietaryPreferences && meal.dietaryPreferences.length > 0) {
    content += `Dietary: ${meal.dietaryPreferences.join(", ")}\n\n`;
  }
  
  if (meal.notes) {
    content += `Notes: ${meal.notes}\n\n`;
  }
  
  if (meal.rating) {
    content += `Rating: ${meal.rating}/5 stars\n`;
  }
  
  return content;
};

export const generateShoppingListContent = (items: GroceryItem[]): string => {
  if (items.length === 0) {
    return "SHOPPING LIST\n============\n\nNo items in the shopping list.";
  }

  let content = "SHOPPING LIST\n";
  content += "=============\n\n";
  
  // Group by store
  const groupedByStore: Record<string, Record<string, GroceryItem[]>> = {};
  
  items.forEach(item => {
    const store = item.store || "General";
    const category = item.category || "Other";
    
    if (!groupedByStore[store]) {
      groupedByStore[store] = {};
    }
    
    if (!groupedByStore[store][category]) {
      groupedByStore[store][category] = [];
    }
    
    groupedByStore[store][category].push(item);
  });

  Object.entries(groupedByStore).forEach(([store, categories]) => {
    content += `${store.toUpperCase()}\n`;
    content += "-".repeat(store.length) + "\n";
    
    Object.entries(categories).forEach(([category, items]) => {
      content += `\n${category}:\n`;
      items.forEach(item => {
        content += `• ${item.name}`;
        if (item.quantity) {
          content += ` - ${item.quantity}`;
        }
        content += "\n";
      });
    });
    content += "\n";
  });
  
  return content;
};