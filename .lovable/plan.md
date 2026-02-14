

## Shopping List Item Persistence Fix

### Problem Identified

After thorough investigation, the root cause of items disappearing is in the **meal change effect** in `useShoppingListSync.ts` (lines 147-180). Here is what happens:

1. When any meal changes (add, remove, edit), the effect fires
2. It splits `allItems` into "manual" (IDs starting with `manual-`) and "non-manual"
3. It regenerates shopping list items from current meal ingredients
4. It merges generated items with existing non-manual items **only by name match**
5. Any non-manual item whose name does NOT appear in the freshly generated list **is silently dropped**

This means items like "bananas" (which was a non-manual item not tied to a current meal ingredient) get removed every time a meal changes. The database sync then deletes them from the cloud too, making the loss permanent.

A secondary issue: the `resetList` function in `useListResetActions.ts` generates new `archived-...` IDs for items being archived, breaking the stable UUID strategy and causing the database sync to treat them as new items while the originals get deleted.

### Plan

**1. Fix the meal change merge logic** (`src/hooks/useShoppingList/useShoppingListSync.ts`)

In the meal change effect and `mergeItemsPreservingAssignments`, after merging generated items with matching existing items, also **preserve any non-manual items that have no match in the generated set**. These are items that were added independently (from DB sync, previous sessions, or items whose source meal was removed) and should not be discarded.

The updated merge will:
- Start with generated meal items, preserving assignments from existing matches (current behavior)
- Add back any existing non-manual items that do NOT match any generated item by name (new behavior -- these are "orphaned" items that should be kept)
- Add manual items (current behavior)

**2. Fix the reset list archived ID generation** (`src/hooks/useShoppingList/useListResetActions.ts`)

Change `resetList` to preserve the original item ID when archiving instead of generating a new `archived-...` ID. This keeps the stable UUID strategy intact and prevents the database sync from creating duplicates.

### Technical Details

File: `src/hooks/useShoppingList/useShoppingListSync.ts`
- In `mergeItemsPreservingAssignments`: after building `mergedGeneratedItems`, find items in `currentItems` whose name (lowercase) is NOT in the generated set, and include them in the final result.

File: `src/hooks/useShoppingList/useListResetActions.ts`
- Change the archive mapping to keep `item.id` instead of generating a new `archived-...` ID. Only set `checked: true`.

