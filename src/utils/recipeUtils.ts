
// Functions for recipe parsing and extraction
import { supabase } from "@/integrations/supabase/client";

/**
 * Extract ingredients from a recipe URL via the fetch-recipe edge function
 */
export const extractIngredientsFromRecipeUrl = async (recipeUrl: string): Promise<{
  title?: string;
  ingredients: string[];
  quantities?: Record<string, string>;
}> => {
  try {
    console.log('Fetching recipe from URL via edge function:', recipeUrl);
    
    const { data, error } = await supabase.functions.invoke('fetch-recipe', {
      body: { url: recipeUrl },
    });

    if (error) {
      console.error('Edge function error:', error);
      return { ingredients: ['Failed to extract ingredients. Please add them manually.'] };
    }

    if (!data?.success) {
      console.warn('Recipe fetch unsuccessful:', data?.error);
      return { 
        title: extractTitleFromUrl(recipeUrl),
        ingredients: ['Could not extract ingredients from this URL. Please add them manually.'] 
      };
    }

    return {
      title: data.title || extractTitleFromUrl(recipeUrl),
      ingredients: data.ingredients || [],
      quantities: data.quantities || undefined,
    };
  } catch (error) {
    console.error('Error extracting ingredients:', error);
    return { ingredients: ['Failed to extract ingredients. Please add them manually.'] };
  }
};

/**
 * Extract a human-readable title from a URL as fallback
 */
const extractTitleFromUrl = (url: string): string => {
  const urlParts = url.split('/');
  const lastPart = urlParts[urlParts.length - 1] || urlParts[urlParts.length - 2] || '';
  return lastPart
    .replace(/-/g, ' ')
    .replace(/\.(html|php|aspx)$/i, '')
    .split('?')[0]
    .trim()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Clean and normalize ingredient names
 */
export const cleanIngredientName = (ingredient: string): string => {
  // Remove quantities and units
  const cleanedName = ingredient
    .replace(/^[\d\s\/½¼¾⅓⅔⅛.,]+\s*/, '') // Remove leading numbers/fractions
    .replace(/^(?:cups?|tbsp|tsp|tablespoons?|teaspoons?|oz|ounces?|lbs?|pounds?|g|grams?|ml|liters?|cloves?|cans?|heads?|bunche?s?|stalks?|pieces?|slices?|pinch(?:es)?|dash(?:es)?|large|medium|small)\s+/i, '')
    .replace(/\(.*?\)/g, '')           // Remove parenthetical text
    .trim();
  
  return cleanedName;
};
