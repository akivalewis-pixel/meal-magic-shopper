export type DietaryPreference = 'vegetarian' | 'vegan' | 'kosher' | 'halal' | 'gluten-free' | 'dairy-free' | 'nut-free' | 'none';

export type GroceryCategory = 
  | 'produce' 
  | 'dairy' 
  | 'meat' 
  | 'grains' 
  | 'frozen' 
  | 'pantry' 
  | 'spices' 
  | 'other';

export interface GroceryItem {
  id: string;
  name: string;
  category: GroceryCategory;
  quantity: string;
  checked: boolean;
  meal?: string;
  store?: string;
  department?: string;
  __updateTimestamp?: number; // Added to track UI updates and force re-renders
}

export interface Meal {
  id: string;
  day: string;
  title: string;
  recipeUrl?: string;
  ingredients: string[];
  dietaryPreferences: DietaryPreference[];
  notes?: string;
  lastUsed?: Date; // When this meal was last used
  weekId?: string; // To track which week this meal belongs to
  rating?: number; // 1-5 star rating
}

export interface FamilyPreference {
  id: string;
  familyMember: string;
  likes: string[];
  dislikes: string[];
  allergies: string[];
  dietaryPreferences: DietaryPreference[];
}

export interface PantryItem {
  id: string;
  name: string;
  quantity: string;
  category: GroceryCategory;
}

export interface WeeklyMealPlan {
  id: string;
  weekStartDate: string; // ISO date string for the start of the week
  name: string; // Optional name/label for the week
  meals: Meal[];
}
