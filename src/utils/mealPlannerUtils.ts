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

export const generateShoppingList = (meals: Meal[], pantryItems: string[], recurringItems: GroceryItem[] = []): GroceryItem[] => {
  // Get all ingredients from meals
  const allIngredients = meals.flatMap(meal => 
    meal.ingredients.map(ingredient => ({
      id: `${meal.id}-${ingredient}`,
      name: ingredient,
      category: determineCategory(ingredient),
      quantity: "1", // Default quantity, could be improved with ingredient parsing
      checked: false,
      meal: meal.title,
      recurring: false,
      store: "",
      department: ""
    }))
  );
  
  // Filter out ingredients that are already in the pantry
  const filteredIngredients = allIngredients.filter(
    item => !pantryItems.some(pantryItem => 
      pantryItem.toLowerCase().includes(item.name.toLowerCase())
    )
  );
  
  // Remove duplicates by combining quantities
  const uniqueIngredients = filteredIngredients.reduce((acc, item) => {
    const existingItem = acc.find(i => i.name.toLowerCase() === item.name.toLowerCase());
    if (existingItem) {
      // If quantities are numbers, add them, otherwise keep them as is
      const numQuantity = Number(existingItem.quantity);
      const newNumQuantity = Number(item.quantity);
      if (!isNaN(numQuantity) && !isNaN(newNumQuantity)) {
        existingItem.quantity = (numQuantity + newNumQuantity).toString();
      }
      existingItem.meal = `${existingItem.meal}, ${item.meal}`;
    } else {
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
  
  // Sort by category
  return uniqueIngredients.sort((a, b) => {
    const categoryOrder = groceryCategories.map(cat => cat.value);
    if (a.store && b.store && a.store === b.store) {
      return (a.department || "").localeCompare(b.department || "");
    }
    return (a.store || "").localeCompare(b.store || "") || 
           categoryOrder.indexOf(a.category) - categoryOrder.indexOf(b.category);
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
