
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
        content += `
          <p class="meal-title">${meal.title}</p>
        `;
        
        if (meal.recipeUrl) {
          content += `
            <p><a href="${meal.recipeUrl}" target="_blank">${meal.recipeUrl.substring(0, 15)}${meal.recipeUrl.length > 15 ? '...' : ''}</a></p>
          `;
        }
      });
    } else {
      content += `
        <p>No meal planned</p>
      `;
    }
    
    content += `</div>`;
  });
  
  content += '</div>';
  return content;
};

export const groupItemsByStoreAndCategory = (items: GroceryItem[]): GroupedItems => {
  console.log("PrintContentGenerator: Grouping", items.length, "items for print");
  
  // Sort items first by store, then by category
  const sortedItems = [...items].sort((a, b) => {
    const storeA = a.store || "Unassigned";
    const storeB = b.store || "Unassigned";
    
    // First sort by store
    if (storeA !== storeB) {
      // Put "Unassigned" at the end
      if (storeA === "Unassigned") return 1;
      if (storeB === "Unassigned") return -1;
      return storeA.localeCompare(storeB);
    }
    
    // Then sort by category within the same store
    return a.category.localeCompare(b.category);
  });

  const groupedByStore: GroupedItems = {};
  
  sortedItems.forEach(item => {
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

  console.log("PrintContentGenerator: Grouped items by store:", 
    Object.entries(groupedByStore).map(([store, categories]) => ({
      store,
      categoryCount: Object.keys(categories).length,
      totalItems: Object.values(categories).flat().length
    }))
  );

  return groupedByStore;
};

export const generateShoppingListContent = (items: GroceryItem[]): string => {
  if (items.length === 0) {
    return '<p>No active items to print!</p>';
  }

  console.log("PrintContentGenerator: Generating content for", items.length, "items");
  
  const groupedByStore = groupItemsByStoreAndCategory(items);
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
      
      content += `
        <div class="category-title">${displayCategory}</div>
      `;
      
      items.forEach(item => {
        content += `
          <div class="item">
            <span>${item.name}</span>
            ${item.quantity ? `<span> - ${item.quantity}</span>` : ''}
          </div>
        `;
      });
    });
    
    content += `
        </div>
      </div>
    `;
  });
  
  content += '</div>';
  
  console.log("PrintContentGenerator: Generated content for stores:", storeNames);
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
        <h1>Pantry Pilot: Weekly Meal Plan</h1>
        ${mealPlanContent}
        <h1>Pantry Pilot: Shopping List</h1>
        ${shoppingListContent}
      </div>
    </body>
    </html>
  `;
};
