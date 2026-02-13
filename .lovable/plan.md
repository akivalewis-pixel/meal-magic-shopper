

## Meal Planner End-to-End Review: Issues Found and Recommended Improvements

### Critical Issues

#### 1. Recipe URL "Fetch" is fake -- no actual web scraping
The `extractIngredientsFromRecipeUrl` function in `src/utils/recipeUtils.ts` does not actually fetch any URL. It uses hardcoded keyword matching (e.g., if URL contains "pasta", return preset ingredients). Any real recipe URL will return "Please add ingredients manually." This is why "recipes wouldn't load properly when linked."

**Fix:** Create a Supabase Edge Function that uses a real HTML parser to fetch the recipe page and extract ingredients from structured data (JSON-LD, Microdata) which most recipe sites use. Fall back to heuristic parsing. The client would call this edge function instead of the fake local function.

#### 2. Weekly Plan loading has an N+1 query problem and returns wrong meals
In `useSupabaseMealPlan.ts` lines 73-87, when loading weekly plans, the code fetches ALL meals with a day assigned for EVERY plan -- not the meals that were actually saved with that specific plan. The `weekly_plan_meals` table exists but is never used for saving plan snapshots. This means loading a saved weekly plan shows whatever meals currently have days assigned, not the historical snapshot.

**Fix:** When saving a weekly plan, also insert the meal snapshots into `weekly_plan_meals`. When loading plans, read from `weekly_plan_meals` filtered by `plan_id` instead of re-querying the `meals` table.

#### 3. Shopping list delete-then-upsert race condition
In `useShoppingListDatabaseSync.ts` lines 101-110, every sync deletes ALL items for the user, then re-inserts. If two tabs or devices sync simultaneously, one can delete the other's just-inserted data. The upsert at line 177 helps with conflicts, but the preceding `DELETE` wipes everything first.

**Fix:** Remove the delete-all-then-insert pattern. Instead, use a pure upsert strategy: upsert all current items, then delete only items whose IDs are NOT in the current set (using `.not('id', 'in', currentIds)`).

#### 4. Shopping list sync debounce can skip saves
The auto-sync effect (lines 208-219) uses both a 5-second cooldown AND a 2-second setTimeout. If items change rapidly, the 5-second cooldown blocks the effect, and if the component unmounts during the 2-second wait, the save is lost.

**Fix:** Use a proper debounce that always fires after the last change, removing the cooldown gate.

### Moderate Issues

#### 5. Archived items get non-stable IDs
In `useShoppingListActions.ts` line 88, archiving prepends `archived-${Date.now()}-` to the ID. This means the same item gets a different DB ID every time it's archived/unarchived, creating orphaned rows.

**Fix:** Keep the original item ID when archiving (just set `checked: true`). The `is_manual` flag and `checked` column already distinguish state.

#### 6. Quantity parsing is fragile
In `groceryUtils.ts` line 18, the quantity regex only matches specific units at the start of the string. Ingredients like "2 large onions" or "1/2 cup flour" get a default quantity of "1". This is why "quantities for shopping lists would be scrambled."

**Fix:** Improve the quantity extraction regex to handle fractions (e.g., `1/2`), mixed numbers (`1 1/2`), and more unit variations. Also preserve the original ingredient string's quantity portion rather than trying to parse it separately.

#### 7. Meal-generated shopping list IDs are not UUIDs
In `useShoppingListGeneration.ts` line 42, IDs are `meal-${mealId}-${itemName}` which are not valid UUIDs. These get converted to UUIDs during sync via `getUniqueDbId`, but the identity is lost on each sync cycle, potentially creating duplicates.

**Fix:** Generate a deterministic UUID (UUID v5 with a namespace) from the meal+item name, so the same ingredient always maps to the same DB ID.

### UX Improvements

#### 8. No confirmation before resetting meal plan
`handleResetMealPlan` immediately clears all days. A confirmation dialog should be shown.

**Note:** The `MealPlanResetDialog` component exists -- verify it's being used in `MealPlanHeader`.

#### 9. No loading/saving indicators during cloud sync
Users have no visibility into whether their shopping list changes are being saved to the cloud. Adding a small sync status indicator (Saving.../Saved/Error) would prevent confusion.

#### 10. Ingredients field is a single text input
The Add Recipe dialog uses a single comma-separated text input for ingredients. A multi-line textarea or a dynamic list where users can add/remove individual ingredients would be more user-friendly and reduce parsing errors.

### Implementation Plan (Priority Order)

**Step 1: Fix Weekly Plan save/load to use `weekly_plan_meals` table**
- Modify `handleSaveWeeklyPlan` to insert meal snapshots into `weekly_plan_meals`
- Modify `loadWeeklyPlans` to read from `weekly_plan_meals` by `plan_id`
- Fix the N+1 query

**Step 2: Fix shopping list sync strategy (eliminate delete-all)**
- Replace delete-then-insert with upsert + selective delete
- Fix the debounce to reliably fire
- Keep stable IDs when archiving items

**Step 3: Create a real recipe fetcher edge function**
- New edge function `fetch-recipe` that fetches the URL server-side
- Parse JSON-LD structured data (used by most recipe sites)
- Fall back to meta tag and heuristic extraction
- Update `AddRecipeDialog` to call the edge function

**Step 4: Improve quantity parsing**
- Enhanced regex to handle fractions, mixed numbers, and more units
- Preserve original quantity strings from ingredients

**Step 5: UX polish**
- Change ingredients input to a textarea for better multi-line editing
- Add cloud sync status indicator to shopping list header
- Verify reset confirmation dialog is wired up

### Technical Details

**Files to modify:**
- `src/hooks/useSupabaseMealPlan.ts` -- fix weekly plan save/load
- `src/hooks/useShoppingList/useShoppingListDatabaseSync.ts` -- fix sync strategy
- `src/hooks/useShoppingList/useShoppingListActions.ts` -- stable archive IDs
- `src/utils/groceryUtils.ts` -- improve quantity parsing
- `src/utils/recipeUtils.ts` -- remove fake implementation, call edge function
- `src/components/MealPlan/AddRecipeDialog.tsx` -- textarea for ingredients
- `supabase/functions/fetch-recipe/index.ts` -- new edge function

**New edge function:** `fetch-recipe`
- Accepts `{ url: string }` POST body
- Fetches the URL, parses HTML for JSON-LD recipe schema
- Returns `{ title, ingredients[], quantities }` 
- Handles errors gracefully with fallback messages

