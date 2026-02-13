
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
  const cleanedName = ingredient
    .replace(/^[\d\s\/½¼¾⅓⅔⅛⅜⅝⅞.,]+\s*/, '') // Remove leading numbers/fractions
    // Remove units (possibly repeated, e.g. "14.5 oz can")
    .replace(/^(?:cups?|tbsp|tsp|tablespoons?|teaspoons?|oz|ounces?|lbs?|pounds?|g|grams?|kg|ml|liters?|l|fl\.?\s*oz|cloves?|cans?|heads?|bunche?s?|bundles?|stalks?|pieces?|slices?|pinch(?:es)?|dash(?:es)?|large|medium|small|packages?|pkgs?|bags?|boxes?|jars?|bottles?|containers?|sticks?|sprigs?|handful(?:s)?)\b[\s.,of]*/gi, '')
    // Run unit removal again to catch chained units like "14.5 oz can diced tomatoes"
    .replace(/^[\d\s\/½¼¾⅓⅔⅛.,]+\s*/, '')
    .replace(/^(?:cups?|tbsp|tsp|tablespoons?|teaspoons?|oz|ounces?|lbs?|pounds?|g|grams?|kg|ml|liters?|l|fl\.?\s*oz|cloves?|cans?|heads?|bunche?s?|bundles?|stalks?|pieces?|slices?|pinch(?:es)?|dash(?:es)?|large|medium|small|packages?|pkgs?|bags?|boxes?|jars?|bottles?|containers?|sticks?|sprigs?|handful(?:s)?)\b[\s.,of]*/gi, '')
    .replace(/\(.*?\)/g, '')           // Remove parenthetical text
    // Remove preparation descriptors
    .replace(/\b(?:diced|chopped|minced|sliced|crushed|ground|shredded|grated|melted|softened|divided|to taste|optional|freshly|fresh|dried|frozen|cooked|uncooked|raw|boneless|skinless|trimmed|peeled|seeded|deveined|rinsed|drained|packed|loosely|thinly|finely|roughly|coarsely)\b/gi, '')
    .replace(/,\s*,/g, ',')           // Clean up double commas
    .replace(/^\s*,\s*/, '')           // Remove leading commas
    .replace(/\s*,\s*$/, '')           // Remove trailing commas
    .replace(/\s{2,}/g, ' ')          // Collapse whitespace
    .trim();
  
  return cleanedName;
};
