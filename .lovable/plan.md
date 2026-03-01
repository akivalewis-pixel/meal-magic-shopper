

## Fix: Shopping List Items Lost When Adding Individual Items

### Root Cause

There are two interconnected bugs causing items from the recipe workflow to disappear when adding a manual item:

**Bug 1: Stale closure in `saveToLocalStorage`**
In `useShoppingListActions.ts`, `addItem` calls `setAllItems(prev => [...prev, newItem])` then immediately calls `saveToLocalStorage()`. However, `saveToLocalStorage` (defined in `useShoppingListPersistenceActions.ts`) captures `allItems` in its closure. At the moment it's called, `allItems` is still the OLD value (React state hasn't re-rendered yet). This writes the pre-addition items to localStorage, briefly overwriting the correct data.

**Bug 2: Meal change effect depends on `allItems`**
In `useShoppingListSync.ts`, the effect that handles meal changes (line 163-196) includes `allItems` in its dependency array. When a manual item is added and `allItems` changes, this effect fires. Although there's a guard (`mealChangeKey !== lastMealChangeRef.current`), there's a race condition during initialization: `lastMealChangeRef.current` is never set during `loadFromStorage`, so the first post-init trigger of this effect runs the full merge -- which can overwrite the just-added manual item if the timing is wrong.

**Bug 3: Initialization race condition**
The init effect in `useShoppingListSync` depends on `generatedMealItems`. If meals load asynchronously AFTER the init effect starts, `generatedMealItems` changes, causing the init effect to re-run. Since `isInitializedRef.current` may still be `false` (async `loadFromStorage` hasn't finished), a second load can be triggered, potentially overwriting items.

### Fix Plan

#### 1. Remove direct `saveToLocalStorage()` calls from action functions
**Files:** `useShoppingListActions.ts`, `useConsolidatedUpdateActions.ts`, `useListResetActions.ts`

Instead of calling `saveToLocalStorage()` directly after state updates (which always uses stale closures), rely entirely on the existing save effect in `useShoppingListSync.ts` (line 199-204) which automatically saves whenever `allItems` changes. This eliminates the stale write problem completely.

- Remove `saveToLocalStorage()` calls from `addItem`, `toggleItem`, `deleteItem`, `updateStores` in `useShoppingListActions.ts`
- Remove `setTimeout(() => saveToLocalStorage(), 0)` from `useConsolidatedUpdateActions.ts`
- Remove `setTimeout(() => saveToLocalStorage(), 0)` from `useListResetActions.ts`
- Remove `saveToLocalStorage` from the props interfaces of these hooks (they no longer need it)

#### 2. Use a ref for `allItems` in the meal change effect
**File:** `useShoppingListSync.ts`

- Add `const allItemsRef = useRef(allItems)` and keep it synced with `allItems`
- In the meal change effect, read `allItemsRef.current` instead of `allItems` from the closure
- Remove `allItems` from the effect's dependency array so it only fires when meals actually change
- Set `lastMealChangeRef.current = mealChangeKey` during initialization to prevent the first post-init run from doing an unnecessary merge

#### 3. Guard initialization against double-execution
**File:** `useShoppingListSync.ts`

- Add a `loadingRef` to track whether an async load is already in progress
- Skip the init effect if a load is already running
- Remove `generatedMealItems` from the init effect's dependency array (it's only needed for the initial merge, which the meal change effect handles)

### Technical Details

**`src/hooks/useShoppingList/useShoppingListActions.ts`**
- Remove `saveToLocalStorage` from the props interface and all internal calls
- Keep `setAllItems`, `setManualItems`, `setArchivedItems` functional updaters (these are correct)

**`src/hooks/useShoppingList/useConsolidatedUpdateActions.ts`**
- Remove `saveToLocalStorage` from props and the `setTimeout` call on line 84

**`src/hooks/useShoppingList/useListResetActions.ts`**
- Remove `saveToLocalStorage` from props and the `setTimeout` call on line 53

**`src/hooks/useShoppingList/useShoppingListSync.ts`**
- Add `allItemsRef` to track current items without causing effect re-runs
- Set `lastMealChangeRef.current = mealChangeKey` in init path
- Change meal change effect deps from `[mealChangeKey, generatedMealItems, allItems]` to `[mealChangeKey, generatedMealItems]`
- Add `loadingRef` guard to init effect
- Simplify init effect deps (remove `generatedMealItems`)

**`src/hooks/useShoppingList.ts`**
- Remove `saveToLocalStorage` from the props passed to `useShoppingListActions`

