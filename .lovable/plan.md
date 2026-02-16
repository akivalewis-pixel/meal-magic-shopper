

## UI/UX Improvements: Loading, Error, Empty States, Dashboard, and Performance

### Overview
Add polished loading, error, and empty state components, a mobile dashboard view, and performance optimizations to the existing app.

### Changes

**1. Create `src/components/LoadingState.tsx`**
- Animated loading screen with the app icon, pulsing dots, and a rotating pro tip
- Replaces the bare spinner currently shown during initial load

**2. Create `src/components/ErrorState.tsx`**
- Error display with network-aware messaging, collapsible technical details, and Retry/Go Home buttons
- Handles both network errors and general failures gracefully

**3. Create `src/components/EmptyState.tsx`**
- Reusable empty state with animated emoji icon, title, description, and optional action buttons
- Can be used across meal plan and shopping list sections when they have no data

**4. Create `src/components/DashboardView.tsx`**
- Mobile-only home tab dashboard showing:
  - Stats cards (meals planned, items to buy, saved plans)
  - Quick action buttons to jump to Meals or Shopping
  - Weekly progress bar (X/7 meals)
  - Pro tip card and getting-started guidance for new users

**5. Update `src/hooks/useSupabaseMealPlan.ts`**
- Add `error` state and `retry` function
- Wrap `loadMeals` with proper error capture into the `error` state
- Expose `error` and `retry` in the return object

**6. Update `src/pages/Index.tsx`**
- Import and use `LoadingState`, `ErrorState`, and `DashboardView`
- Add `useCallback`/`useMemo` for memoized handler props to reduce re-renders
- Show `DashboardView` on mobile "home" tab instead of showing meal plan + shopping together
- Separate "home" tab from "meals" tab (home = dashboard, meals = meal plan + weekly plans)
- Add skip-to-content link and ARIA landmarks for accessibility

**7. `src/components/MobileBottomNav.tsx`** -- No changes needed
- Already has the correct `MobileSection` type with "home" | "shopping" | "meals" and all three tabs

### What stays the same
- All existing shopping list logic, meal plan logic, and database sync are untouched
- The desktop layout remains unchanged (all sections visible)
- No database or schema changes required

