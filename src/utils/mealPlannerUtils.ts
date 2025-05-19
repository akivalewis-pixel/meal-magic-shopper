import { GroceryItem, Meal, GroceryCategory, DietaryPreference, WeeklyMealPlan } from "@/types";

export const daysOfWeek = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday"
];

export const dietaryOptions: { label: string; value: DietaryPreference }[] = [
  { label: "None", value: "none" },
  { label: "Vegetarian", value: "vegetarian" },
  { label: "Vegan", value: "vegan" },
  { label: "Kosher", value: "kosher" },
  { label: "Halal", value: "halal" },
  { label: "Gluten-Free", value: "gluten-free" },
  { label: "Dairy-Free", value: "dairy-free" },
  { label: "Nut-Free", value: "nut-free" },
];

export const groceryCategories: { label: string; value: GroceryCategory }[] = [
  { label: "Produce", value: "produce" },
  { label: "Dairy", value: "dairy" },
  { label: "Meat", value: "meat" },
  { label: "Grains", value: "grains" },
  { label: "Frozen", value: "frozen" },
  { label: "Pantry", value: "pantry" },
  { label: "Spices", value: "spices" },
  { label: "Other", value: "other" },
];

export const departments = [
  "Produce",
  "Dairy",
  "Meat & Seafood",
  "Bakery",
  "Frozen Foods",
  "Canned Goods",
  "Dry Goods",
  "Beverages",
  "Snacks",
  "International",
  "Health & Beauty",
  "Household",
  "Other"
];

export const extractIngredientsFromRecipeUrl = async (recipeUrl: string): Promise<{
  title?: string;
  ingredients: string[];
  quantities?: Record<string, string>;
}> => {
  try {
    console.log('Fetching recipe from URL:', recipeUrl);
    
    // Simple heuristic-based extraction for common recipe formats
    const lowerUrl = recipeUrl.toLowerCase();
    let title = "";
    let ingredients: string[] = [];
    let quantities: Record<string, string> = {};
    
    // Extract recipe title from URL
    const urlParts = recipeUrl.split('/');
    const lastPart = urlParts[urlParts.length - 1] || urlParts[urlParts.length - 2] || '';
    title = lastPart
      .replace(/-/g, ' ')
      .replace(/\.(html|php|aspx)$/i, '')
      .split('?')[0]
      .trim();
    
    // Capitalize each word
    title = title
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
      
    // For demo purposes, let's return different ingredient sets based on URL keywords
    if (lowerUrl.includes('pasta') || lowerUrl.includes('spaghetti')) {
      ingredients = ['pasta', 'tomatoes', 'garlic', 'onion', 'olive oil', 'basil'];
      quantities = {
        'pasta': '1 lb',
        'tomatoes': '3',
        'garlic': '2 cloves',
        'onion': '1 medium',
        'olive oil': '2 tbsp',
        'basil': '1/4 cup'
      };
    }
    else if (lowerUrl.includes('chicken')) {
      ingredients = ['chicken breast', 'salt', 'pepper', 'olive oil', 'garlic powder', 'herbs'];
      quantities = {
        'chicken breast': '2 lbs',
        'salt': '1 tsp',
        'pepper': '1/2 tsp',
        'olive oil': '3 tbsp',
        'garlic powder': '1 tsp',
        'herbs': '2 tbsp'
      };
    }
    else if (lowerUrl.includes('salad')) {
      ingredients = ['lettuce', 'cucumber', 'tomatoes', 'bell pepper', 'olive oil', 'vinegar'];
      quantities = {
        'lettuce': '1 head',
        'cucumber': '1',
        'tomatoes': '2',
        'bell pepper': '1',
        'olive oil': '2 tbsp',
        'vinegar': '1 tbsp'
      };
    } 
    else if (lowerUrl.includes('soup')) {
      ingredients = ['broth', 'onion', 'carrots', 'celery', 'salt', 'pepper', 'herbs'];
      quantities = {
        'broth': '4 cups',
        'onion': '1',
        'carrots': '2',
        'celery': '2 stalks',
        'salt': '1 tsp',
        'pepper': '1/2 tsp',
        'herbs': '1 tbsp'
      };
    }
    else if (lowerUrl.includes('pizza')) {
      ingredients = ['pizza dough', 'tomato sauce', 'mozzarella cheese', 'olive oil', 'basil'];
      quantities = {
        'pizza dough': '1 lb',
        'tomato sauce': '1 cup',
        'mozzarella cheese': '2 cups',
        'olive oil': '1 tbsp',
        'basil': '8 leaves'
      };
    }
    else {
      ingredients = ['Please add ingredients manually for this recipe'];
    }
    
    return {
      title: title || undefined,
      ingredients,
      quantities: Object.keys(quantities).length > 0 ? quantities : undefined
    };
  } catch (error) {
    console.error('Error extracting ingredients:', error);
    return { ingredients: ['Failed to extract ingredients'] };
  }
};

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

// Function to guess the category of an ingredient based on common items
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

// Function to filter meals by dietary preference
export const filterMealsByDiet = (meals: Meal[], dietPreference: DietaryPreference): Meal[] => {
  if (dietPreference === 'none') {
    return meals;
  }
  return meals.filter(meal => meal.dietaryPreferences.includes(dietPreference));
};

// Generate a placeholder meal plan for demo purposes
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

export const samplePantryItems: string[] = [
  'salt',
  'pepper',
  'olive oil',
  'vegetable oil',
  'flour',
  'sugar',
  'pasta',
  'rice',
  'canned tomatoes',
  'soy sauce',
  'ketchup',
  'mustard',
  'mayo',
  'salad dressing',
  'vinegar'
];

export const sampleFamilyPreferences = [
  {
    id: '1',
    familyMember: 'Kids',
    likes: ['pizza', 'pasta', 'chicken nuggets', 'mac and cheese', 'tacos'],
    dislikes: ['brussels sprouts', 'mushrooms', 'spicy food'],
    allergies: [],
    dietaryPreferences: ['none'] as DietaryPreference[]
  },
  {
    id: '2',
    familyMember: 'Adults',
    likes: ['salmon', 'curry', 'stir fry', 'salad', 'roasted vegetables'],
    dislikes: [],
    allergies: [],
    dietaryPreferences: ['none'] as DietaryPreference[]
  }
];

// Function to get an ISO string for the start of the current week (Sunday)
export const getCurrentWeekStart = (): string => {
  const today = new Date();
  const day = today.getDay(); // 0 for Sunday, 1 for Monday, etc.
  const diff = today.getDate() - day;
  const startOfWeek = new Date(today.setDate(diff));
  startOfWeek.setHours(0, 0, 0, 0);
  return startOfWeek.toISOString();
};

// Function to format a date to show as week range (e.g., "Feb 2 - Feb 8, 2025")
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

// Function to convert ISO week start to a more readable format
export const formatWeekStartDate = (isoString: string): string => {
  const date = new Date(isoString);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
};

// Function to search meals across all saved weekly plans
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

// Function to find the most recent use of a meal
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

// Function to count how many times a meal has been used
export const countMealUsage = (weeklyPlans: WeeklyMealPlan[], mealTitle: string): number => {
  return weeklyPlans.reduce((count, plan) => {
    return count + plan.meals.filter(meal => meal.title === mealTitle).length;
  }, 0);
};

// Expose a new function to clean and normalize ingredient names
export const cleanIngredientName = (ingredient: string): string => {
  // Remove quantities and units
  const cleanedName = ingredient
    .replace(/^\d+\s*\/\s*\d+\s+/, '') // Remove fractions like "1/2 "
    .replace(/^\d+\s+/, '')            // Remove leading numbers like "2 "
    .replace(/^a\s+/i, '')             // Remove leading "a "
    .replace(/^an\s+/i, '')            // Remove leading "an "
    .replace(/\(.*?\)/g, '')           // Remove parenthetical text
    .trim();
  
  return cleanedName;
};
