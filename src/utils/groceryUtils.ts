// Grocery and shopping list related utility functions
import { GroceryItem, Meal, GroceryCategory } from "@/types";
import { cleanIngredientName } from "./recipeUtils";
import { groceryCategories } from "./constants";

/**
 * Generate a shopping list based on meals and pantry items
 */
export const generateShoppingList = (meals: Meal[], pantryItems: string[], previousItems: GroceryItem[] = []): GroceryItem[] => {
  // Get all ingredients from meals
  const allIngredients = meals.flatMap(meal => 
    meal.ingredients.map(ingredient => {
      // Clean the ingredient name to improve matching
      const cleanedName = cleanIngredientName(ingredient);
      
      // Extract quantity from the ingredient string — handles fractions, mixed numbers, and many units
      let quantity = "1";
      const quantityMatch = ingredient.match(
        /^((?:\d+\s+)?\d+\/\d+|\d+(?:\.\d+)?)\s*(oz|ounces?|cups?|tbsp|tsp|teaspoons?|tablespoons?|lbs?|pounds?|g|grams?|ml|liters?|l|cloves?|cans?|heads?|bunche?s?|stalks?|pieces?|slices?|pinche?s?|dashe?s?|large|medium|small)?\b/i
      );
      if (quantityMatch) {
        quantity = quantityMatch[0].trim();
      }
      
      return {
        id: `${meal.id}-${cleanedName}`,
        name: cleanedName,
        category: determineCategory(cleanedName),
        quantity: quantity,
        checked: false,
        meal: meal.title,
        store: "Unassigned",
        department: ""
      };
    })
  );
  
  // Filter out ingredients that are already in the pantry (using case-insensitive matching)
  const filteredIngredients = allIngredients.filter(
    item => !pantryItems.some(pantryItem => 
      item.name.toLowerCase().includes(pantryItem.toLowerCase()) || 
      pantryItem.toLowerCase().includes(item.name.toLowerCase())
    )
  );
  
  // Find existing grocery items by name for preserving data
  const existingItemsByName: Record<string, GroceryItem> = {};
  
  // Add previous items to the lookup
  previousItems.forEach(item => {
    existingItemsByName[item.name.toLowerCase()] = item;
  });
  
  // Remove duplicates by combining quantities and meals
  const uniqueIngredients = filteredIngredients.reduce((acc, item) => {
    // Look for existing item by name (case insensitive)
    const existingItem = acc.find(i => i.name.toLowerCase() === item.name.toLowerCase());
    
    if (existingItem) {
      // If quantities are numbers, add them, otherwise keep them as is
      const numQuantity = parseFloat(existingItem.quantity);
      const newNumQuantity = parseFloat(item.quantity);
      
      if (!isNaN(numQuantity) && !isNaN(newNumQuantity)) {
        existingItem.quantity = (numQuantity + newNumQuantity).toString();
      } else {
        // If not numeric, try to extract numbers and add them
        const existingMatch = existingItem.quantity.match(/\d+(\.\d+)?/);
        const newMatch = item.quantity.match(/\d+(\.\d+)?/);
        
        if (existingMatch && newMatch) {
          const existingNum = parseFloat(existingMatch[0]);
          const newNum = parseFloat(newMatch[0]);
          const totalNum = existingNum + newNum;
          
          // Replace the number in the existing quantity string
          existingItem.quantity = existingItem.quantity.replace(/\d+(\.\d+)?/, totalNum.toString());
        }
      }
      
      // Update meal reference to show all recipes using this ingredient
      if (!existingItem.meal.includes(item.meal)) {
        existingItem.meal = existingItem.meal ? `${existingItem.meal}, ${item.meal}` : item.meal;
      }
    } else {
      // Check if we have an existing item with the same name from previous items
      const existingPreviousItem = existingItemsByName[item.name.toLowerCase()];
      if (existingPreviousItem) {
        // Preserve store and department information, but ensure store is never empty
        item.store = existingPreviousItem.store || "Unassigned";
        item.department = existingPreviousItem.department || item.department;
      }
      acc.push(item);
    }
    return acc;
  }, [] as GroceryItem[]);
  
  // Sort by store and category
  return uniqueIngredients.sort((a, b) => {
    if (a.store && b.store && a.store !== b.store) {
      return a.store.localeCompare(b.store);
    }
    
    if (a.store && b.store && a.store === b.store) {
      if (a.department && b.department) {
        return a.department.localeCompare(b.department);
      }
      return groceryCategories.findIndex(cat => cat.value === a.category) - 
             groceryCategories.findIndex(cat => cat.value === b.category);
    }
    
    return (a.store || "").localeCompare(b.store || "") || 
           groceryCategories.findIndex(cat => cat.value === a.category) - 
           groceryCategories.findIndex(cat => cat.value === b.category);
  });
};

/**
 * Guess the category of an ingredient based on common items
 */
export const determineCategory = (ingredient: string): GroceryCategory => {
  const lowerIngredient = ingredient.toLowerCase();
  
  // Define keywords for each category
  const categoryKeywords: Record<GroceryCategory, string[]> = {
    produce: ['apple', 'banana', 'lettuce', 'tomato', 'onion', 'potato', 'carrot', 'broccoli', 'spinach', 'pepper', 'cucumber', 'lemon'],
    dairy: ['milk', 'cheese', 'yogurt', 'butter', 'cream', 'egg', 'sour cream'],
    meat: ['chicken', 'beef', 'pork', 'fish', 'salmon', 'tuna', 'turkey', 'meat', 'steak', 'bacon', 'sausage'],
    grains: ['rice', 'pasta', 'bread', 'flour', 'cereal', 'oats', 'grain', 'quinoa', 'tortilla'],
    frozen: ['frozen', 'ice cream', 'pizza', 'fries'],
    pantry: ['can', 'canned', 'sauce', 'oil', 'vinegar', 'beans', 'soup', 'pasta', 'rice', 'cereal'],
    spices: ['salt', 'pepper', 'spice', 'herb', 'seasoning', 'oregano', 'basil', 'thyme', 'cumin', 'cinnamon'],
    other: []
  };
  
  // Check if ingredient contains any of the keywords
  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    if (keywords.some(keyword => lowerIngredient.includes(keyword))) {
      return category as GroceryCategory;
    }
  }
  
  // Default to "other" if no match found
  return 'other';
};
