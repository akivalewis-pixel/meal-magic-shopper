const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url } = await req.json();

    if (!url) {
      return new Response(
        JSON.stringify({ success: false, error: 'URL is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let formattedUrl = url.trim();
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = `https://${formattedUrl}`;
    }

    console.log('Fetching recipe from:', formattedUrl);

    // Fetch the page HTML
    const response = await fetch(formattedUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; MealPlannerBot/1.0)',
        'Accept': 'text/html,application/xhtml+xml',
      },
    });

    if (!response.ok) {
      return new Response(
        JSON.stringify({ success: false, error: `Failed to fetch URL: ${response.status}` }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const html = await response.text();
    
    // Try to extract JSON-LD structured data first (most recipe sites use this)
    let title: string | undefined;
    let ingredients: string[] = [];
    let quantities: Record<string, string> = {};

    // Extract JSON-LD
    const jsonLdMatches = html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi);
    
    for (const match of jsonLdMatches) {
      try {
        let jsonData = JSON.parse(match[1].trim());
        
        // Handle @graph arrays
        if (jsonData['@graph']) {
          jsonData = jsonData['@graph'];
        }
        
        // Normalize to array
        const items = Array.isArray(jsonData) ? jsonData : [jsonData];
        
        for (const item of items) {
          if (item['@type'] === 'Recipe' || 
              (Array.isArray(item['@type']) && item['@type'].includes('Recipe'))) {
            
            title = item.name || undefined;
            
            if (item.recipeIngredient && Array.isArray(item.recipeIngredient)) {
              ingredients = item.recipeIngredient.map((ing: string) => ing.trim());
            }
            
            break;
          }
        }
        
        if (ingredients.length > 0) break;
      } catch {
        // Skip invalid JSON-LD blocks
      }
    }

    // Fallback: try microdata (itemprop="recipeIngredient")
    if (ingredients.length === 0) {
      const microdataRegex = /itemprop=["']recipeIngredient["'][^>]*>([^<]+)</gi;
      let mdMatch;
      while ((mdMatch = microdataRegex.exec(html)) !== null) {
        const ing = mdMatch[1].trim();
        if (ing) ingredients.push(ing);
      }
    }

    // Fallback: try common ingredient list patterns
    if (ingredients.length === 0) {
      // Look for ingredient lists in common class names
      const ingredientSectionRegex = /class=["'][^"']*ingredient[^"']*["'][^>]*>([\s\S]*?)<\/(?:ul|ol|div|section)>/gi;
      let sectionMatch;
      while ((sectionMatch = ingredientSectionRegex.exec(html)) !== null) {
        const listItemRegex = /<li[^>]*>([\s\S]*?)<\/li>/gi;
        let liMatch;
        while ((liMatch = listItemRegex.exec(sectionMatch[1])) !== null) {
          // Strip HTML tags from list items
          const cleanText = liMatch[1].replace(/<[^>]+>/g, '').trim();
          if (cleanText && cleanText.length > 1 && cleanText.length < 200) {
            ingredients.push(cleanText);
          }
        }
      }
    }

    // Extract title from meta tags if not found in JSON-LD
    if (!title) {
      const ogTitleMatch = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i);
      if (ogTitleMatch) {
        title = ogTitleMatch[1];
      } else {
        const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
        if (titleMatch) {
          title = titleMatch[1].trim();
        }
      }
    }

    // Parse quantities from ingredient strings
    if (ingredients.length > 0) {
      for (const ing of ingredients) {
        const qtyMatch = ing.match(/^([\d\s\/½¼¾⅓⅔⅛]+\s*(?:cups?|tbsp|tsp|tablespoons?|teaspoons?|oz|ounces?|lbs?|pounds?|g|grams?|ml|liters?|cloves?|cans?|heads?|bunche?s?|stalks?|pieces?|slices?|pinch(?:es)?|dash(?:es)?)?)\s+(.+)/i);
        if (qtyMatch) {
          const qty = qtyMatch[1].trim();
          const name = qtyMatch[2].trim();
          quantities[name] = qty;
        }
      }
    }

    console.log(`Extracted: title="${title}", ${ingredients.length} ingredients`);

    return new Response(
      JSON.stringify({
        success: true,
        title,
        ingredients,
        quantities: Object.keys(quantities).length > 0 ? quantities : undefined,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error fetching recipe:', error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Failed to fetch recipe' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
