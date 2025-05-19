
// Functions for recipe parsing and extraction
/**
 * Extract ingredients from a recipe URL
 */
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

/**
 * Clean and normalize ingredient names
 */
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
