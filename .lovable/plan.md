## Fix saved meal plan view + add "Most Common Meals" suggestions

### Problem 1: Saved meal plan doesn't display in full

Two issues in `WeeklyMealPlansSection.tsx`:

1. The inline preview shown after clicking a saved plan card only renders the **day** and **title** — it omits recipe URL, ingredients, dietary preferences, rating, and notes. That's why the menu "isn't showing up properly".
2. The "Open in New Tab" button adds a `?planId=...` query param to the URL, but nothing in `Index.tsx` (or anywhere) reads that param, so the new tab just shows the current state — not the saved plan.

### Problem 2: No surfaced suggestions of common meals

`getFrequentlyUsedMeals` already exists in `src/utils/mealUtils.ts` and powers the `FrequentMealsDialog`, but it's currently only reachable from a small button inside `MealRecommendations`. The user wants an easy way to see most-common-meals as menu-planning inspiration.

### Changes

**1. Full saved-plan view (`src/components/WeeklyMealPlansSection.tsx`)**
- Replace the small "day + title" preview cards with a richer layout grouped by day (Sunday → Saturday), each meal showing:
  - Title (clickable link if `recipeUrl` exists)
  - Star rating (if present)
  - Dietary preference badges
  - Ingredients list (collapsed/expandable, or shown inline)
  - Notes
- Reuse the existing `MealCard` component where it fits, or render a compact read-only variant inline. Read-only — no edit/rate/drag actions in this preview.
- Replace the inline-preview pattern with a **modal dialog** so the full plan can use generous space (current inline area is cramped inside the search card). Triggered by clicking the plan card; "Load This Plan" stays as the primary action in the dialog footer alongside "Close".
- Remove the broken "Open in New Tab" button (since `planId` isn't handled) — the new dialog replaces its purpose.

**2. "Most Common Meals" section (`src/components/WeeklyMealPlansSection.tsx`)**
- Add a new collapsible panel at the top of the Weekly Meal Plans section titled **"Most Common Meals"**, before the search card.
- Show the top ~8 meals from `getFrequentlyUsedMeals(weeklyPlans)`, each as a card with: title, usage count, average/best rating, last-used date, and an **"Add to current plan"** button that calls `onAddMealToCurrentPlan` (wired through from `Index.tsx` → `handleAddMealToDay`).
- Include a "View all" button that opens the existing `FrequentMealsDialog` for the full list.

**3. Wiring (`src/pages/Index.tsx`)**
- Pass `handleAddMealToDay` into `WeeklyMealPlansSection` as a new `onAddMealToCurrentPlan` prop so the Most Common Meals cards can add meals directly.

### Files touched
- `src/components/WeeklyMealPlansSection.tsx` — full-plan dialog + Most Common Meals panel
- `src/pages/Index.tsx` — pass `handleAddMealToDay` prop
- (Optional) small read-only meal preview subcomponent if `MealCard` doesn't cleanly support a read-only mode

No database, types, or backend changes needed.
