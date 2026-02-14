import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

/** Block internal/private IPs and cloud metadata endpoints */
function isBlockedHostname(hostname: string): boolean {
  const lower = hostname.toLowerCase();
  if (
    lower === 'localhost' ||
    lower === '0.0.0.0' ||
    lower === '[::1]' ||
    lower.endsWith('.internal') ||
    lower.endsWith('.local')
  ) return true;

  // Block private IP ranges and cloud metadata
  const blocked = [
    /^127\./, /^10\./, /^192\.168\./, /^172\.(1[6-9]|2\d|3[01])\./,
    /^169\.254\./, /^0\./, /^100\.(6[4-9]|[7-9]\d|1[0-2]\d)\./, 
    /^198\.18\./, /^198\.19\./,
  ];
  return blocked.some(r => r.test(lower));
}

function validateRecipeUrl(raw: string): string | null {
  let formatted = raw.trim();
  if (!formatted.startsWith('http://') && !formatted.startsWith('https://')) {
    formatted = `https://${formatted}`;
  }

  let parsed: URL;
  try {
    parsed = new URL(formatted);
  } catch {
    return null;
  }

  // Only allow http(s)
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return null;

  if (isBlockedHostname(parsed.hostname)) return null;

  // Max URL length
  if (formatted.length > 2048) return null;

  return formatted;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // --- Authentication ---
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // --- Input validation ---
    const { url } = await req.json();

    if (!url || typeof url !== 'string') {
      return new Response(
        JSON.stringify({ success: false, error: 'URL is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const formattedUrl = validateRecipeUrl(url);
    if (!formattedUrl) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid or blocked URL' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Fetching recipe from:', formattedUrl);

    // Fetch the page HTML with timeout and redirect limits
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    let response: Response;
    try {
      response = await fetch(formattedUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; MealPlannerBot/1.0)',
          'Accept': 'text/html,application/xhtml+xml',
        },
        signal: controller.signal,
        redirect: 'follow',
      });
    } catch (fetchError) {
      clearTimeout(timeout);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to fetch the URL' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    clearTimeout(timeout);

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
        
        if (jsonData['@graph']) {
          jsonData = jsonData['@graph'];
        }
        
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

    // Fallback: try microdata
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
      const ingredientSectionRegex = /class=["'][^"']*ingredient[^"']*["'][^>]*>([\s\S]*?)<\/(?:ul|ol|div|section)>/gi;
      let sectionMatch;
      while ((sectionMatch = ingredientSectionRegex.exec(html)) !== null) {
        const listItemRegex = /<li[^>]*>([\s\S]*?)<\/li>/gi;
        let liMatch;
        while ((liMatch = listItemRegex.exec(sectionMatch[1])) !== null) {
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
      JSON.stringify({ success: false, error: 'Failed to fetch recipe' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
