
// Functions for recipe parsing and extraction
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/utils/logger";

/**
 * Extract ingredients from a recipe URL via the fetch-recipe edge function
 */
export const extractIngredientsFromRecipeUrl = async (recipeUrl: string): Promise<{
  title?: string;
  ingredients: string[];
  quantities?: Record<string, string>;
}> => {
  try {
    logger.log('Fetching recipe from URL via edge function:', recipeUrl);
    
    const { data, error } = await supabase.functions.invoke('fetch-recipe', {
      body: { url: recipeUrl },
    });

    if (error) {
      logger.error('Edge function error:', error);
      return { ingredients: ['Failed to extract ingredients. Please add them manually.'] };
    }

    if (!data?.success) {
      logger.warn('Recipe fetch unsuccessful:', data?.error);
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
    logger.error('Error extracting ingredients:', error);
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
  const units = '(?:cups?|tbsp|tsp|tablespoons?|teaspoons?|oz|ounces?|lbs?|pounds?|g|grams?|kg|ml|liters?|l|fl\\.?\\s*oz|cloves?|cans?|heads?|bunche?s?|bundles?|stalks?|pieces?|slices?|pinch(?:es)?|dash(?:es)?|large|medium|small|packages?|pkgs?|bags?|boxes?|jars?|bottles?|containers?|sticks?|sprigs?|handful(?:s)?)';
  const num = '[\\d\\s\\/½¼¾⅓⅔⅛⅜⅝⅞.,]+';

  let s = ingredient
    // Remove parenthetical text
    .replace(/\(.*?\)/g, '')
    // Remove "plus X unit" segments (e.g. "plus 2 tablespoons")
    .replace(/\bplus\s+[\d\s\/½¼¾⅓⅔⅛.,]+\s*\w+/gi, '')
    // Remove slash-separated alternate measurements (e.g. "/150 grams")
    .replace(/\/[\d.,]+\s*\w+/g, '');

  // Repeatedly strip leading number + unit combos
  for (let i = 0; i < 3; i++) {
    s = s
      .replace(new RegExp(`^${num}\\s*`, 'i'), '')
      .replace(new RegExp(`^${units}\\b[\\s.,of]*`, 'gi'), '');
  }

  s = s
    // Remove preparation descriptors
    .replace(/\b(?:diced|chopped|minced|sliced|crushed|ground|shredded|grated|melted|softened|divided|to taste|optional|freshly|fresh|dried|frozen|cooked|uncooked|raw|boneless|skinless|trimmed|peeled|seeded|deveined|rinsed|drained|packed|loosely|thinly|finely|roughly|coarsely|sifted|room temperature|at room temperature|cold|warm|hot|whole|halved|quartered)\b/gi, '')
    // Remove alternative suggestions: "like X", "or X", "such as X"
    .replace(/[,;]?\s*\b(?:like|such as|or)\b\s+.+$/gi, '')
    // Remove leading "or" (e.g. "or matzo cake meal")
    .replace(/^\s*\bor\b\s+/i, '')
    .replace(/,\s*,/g, ',')
    .replace(/^\s*[,\s]+/, '')
    .replace(/\s*,\s*$/, '')
    .replace(/\s{2,}/g, ' ')
    .trim();

  return s;
};
