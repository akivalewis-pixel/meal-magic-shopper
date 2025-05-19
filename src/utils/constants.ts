
// Constants used across the application
import { DietaryPreference, GroceryCategory } from "@/types";

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
