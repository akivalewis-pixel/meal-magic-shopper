
import { Meal, GroceryItem } from "@/types";
import { daysOfWeek } from "@/utils/constants";
import { GroupedItems } from "./types";
import { getPrintStyles } from "./printStyles";

export const generateMealPlanContent = (meals: Meal[]): string => {
  let content = '<div class="meal-plan-grid">';
  
  daysOfWeek.forEach(day => {
    const dayMeals = meals.filter(m => m.day === day);
    
    content += `
      <div class="meal-day">
        <h3 class="day-title">${day}</h3>
    `;
    
    if (dayMeals.length > 0) {
      dayMeals.forEach(meal => {
        content += `<p class="meal-title">${meal.title}</p>`;
        if (meal.recipeUrl) {
          content += `<p><a href="${meal.recipeUrl}" target="_blank">${meal.recipeUrl.substring(0, 15)}${meal.recipeUrl.length > 15 ? '...' : ''}</a></p>`;
        }
      });
    } else {
      content += `<p>No meal planned</p>`;
    }
    
    content += `</div>`;
  });
  
  content += '</div>';
  return content;
};

export const generateShoppingListContent = (items: GroceryItem[]): string => {
  if (items.length === 0) {
    return '<p>No active items to print!</p>';
  }

  console.log("PrintContentGenerator: Generating content for", items.length, "items");
  
  // Group items by store first, then by category
  const groupedByStore: Record<string, Record<string, GroceryItem[]>> = {};
  
  items.forEach(item => {
    const store = item.store || "Unassigned";
    const category = item.category;
    
    if (!groupedByStore[store]) {
      groupedByStore[store] = {};
    }
    
    if (!groupedByStore[store][category]) {
      groupedByStore[store][category] = [];
    }
    
    groupedByStore[store][category].push(item);
  });

  const storeNames = Object.keys(groupedByStore);
  let content = '<div class="store-columns">';

  storeNames.forEach(store => {
    const categories = groupedByStore[store];
    
    content += `
      <div class="store-column">
        <div class="store-section">
          <div class="store-title">${store}</div>
    `;
    
    Object.entries(categories).forEach(([category, items]) => {
      const displayCategory = category.charAt(0).toUpperCase() + category.slice(1);
      
      content += `<div class="category-title">${displayCategory}</div>`;
      
      items.forEach(item => {
        content += `
          <div class="item">
            <span>${item.name}</span>
            ${item.quantity ? `<span> - ${item.quantity}</span>` : ''}
          </div>
        `;
      });
    });
    
    content += `</div></div>`;
  });
  
  content += '</div>';
  return content;
};

export const generateFullPrintContent = (meals: Meal[], items: GroceryItem[]): string => {
  console.log("PrintContentGenerator: Generating full print content with", meals.length, "meals and", items.length, "items");
  
  const mealPlanContent = generateMealPlanContent(meals);
  const shoppingListContent = generateShoppingListContent(items);
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Weekly Meal Plan & Shopping List</title>
      <style>
        ${getPrintStyles()}
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Pantry Pilot: Weekly Meal Plan & Shopping List</h1>
        <div class="main-layout">
          <div class="meal-plan-section">
            <h2 class="meal-plan-title">Weekly Meal Plan</h2>
            ${mealPlanContent}
          </div>
          <div class="shopping-list-section">
            <h2 class="shopping-list-title">Shopping List</h2>
            ${shoppingListContent}
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
};
