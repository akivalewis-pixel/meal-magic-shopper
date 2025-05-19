// Grocery and shopping list related utility functions
import { GroceryItem, Meal, GroceryCategory } from "@/types";
import { cleanIngredientName } from "./recipeUtils";
import { groceryCategories } from "./constants";

/**
 * Generate a shopping list based on meals and pantry items
 */
export const generateShoppingList = (meals: Meal[], pantryItems: string[], recurringItems: GroceryItem[] = []): GroceryItem[] => {
  console.log("Generating shopping list with", meals.length, "meals");
  console.log("Pantry items:", pantryItems);
  
  // Get all ingredients from meals
  const allIngredients = meals.flatMap(meal => 
    meal.ingredients.map(ingredient => {
      // Clean the ingredient name to improve matching
      const cleanedName = cleanIngredientName(ingredient);
      
      // Try to extract quantity from the ingredient string
      let quantity = "1"; // Default quantity
      const quantityMatch = ingredient.match(/^(\d+(\.\d+)?\/?\d*\s*(oz|ounce|cup|tbsp|tsp|teaspoon|tablespoon|lb|pound|g|gram|ml|l|liter)\b)/i);
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
        recurring: false,
        store: "", // Default store
        department: ""
      };
    })
  );
  
  console.log("All ingredients before filtering:", allIngredients);
  
  // Filter out ingredients that are already in the pantry (using case-insensitive matching)
  const filteredIngredients = allIngredients.filter(
    item => !pantryItems.some(pantryItem => 
      item.name.toLowerCase().includes(pantryItem.toLowerCase()) || 
      pantryItem.toLowerCase().includes(item.name.toLowerCase())
    )
  );
  
  console.log("Filtered ingredients after pantry check:", filteredIngredients);
  
  // Find existing grocery items (including recurring) by name for preserving data
  const existingItemsByName: Record<string, GroceryItem> = {};
  
  // Add recurring items to the lookup
  recurringItems.forEach(item => {
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
      // Check if we have an existing item with the same name from recurring items
      const existingRecurringItem = existingItemsByName[item.name.toLowerCase()];
      if (existingRecurringItem) {
        // Preserve store and department information
        item.store = existingRecurringItem.store || item.store;
        item.department = existingRecurringItem.department || item.department;
        item.recurring = existingRecurringItem.recurring || item.recurring;
      }
      acc.push(item);
    }
    return acc;
  }, [] as GroceryItem[]);
  
  // Add recurring items that are not already in the list
  recurringItems.forEach(recurringItem => {
    if (!uniqueIngredients.some(item => item.name.toLowerCase() === recurringItem.name.toLowerCase())) {
      uniqueIngredients.push({
        ...recurringItem,
        checked: false
      });
    }
  });
  
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
