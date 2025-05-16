
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
}

export interface Meal {
  id: string;
  day: string;
  title: string;
  recipeUrl?: string;
  ingredients: string[];
  dietaryPreferences: DietaryPreference[];
  notes?: string;
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
