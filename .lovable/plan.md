

## Fix: Checked Items Reappearing After Adding New Recipe

### Problem
When a new recipe is added, the meal change effect calls `mergeItemsPreservingAssignments` which regenerates items from all active meals. If an item was previously checked (purchased), the merge logic brings it back because:

1. The generated items list always includes ALL ingredients from ALL active meals — it doesn't know which ones were checked
2. The merge preserves store/category assignments from existing items but does NOT preserve `checked: true` state — it spreads `...newItem` first (which has `checked: false`) and only copies `store`, `category`, and `quantity` from the existing item
3. Archived items are stored separately but their names are never excluded from the generated list

### Fix

**File: `src/hooks/useShoppingList/useShoppingListSync.ts`**

In `mergeItemsPreservingAssignments`, two changes:

1. When an existing item matches a generated item AND the existing item is `checked: true`, preserve the `checked` state in the merged result (add `checked: existingItem.checked` to the merge spread)

2. Also filter out items whose names match archived items — build a set of archived item names and exclude generated items that match

In the meal change effect (line 166-182), pass `archivedItems` to the merge function so it can exclude them. Use a ref for archived items to avoid adding it as a dependency.

**Specific changes:**
- Add `archivedItemsRef` that stays in sync with `archivedItems`
- Update `mergeItemsPreservingAssignments` signature to accept an `archivedNames: Set<string>` parameter
- Before processing generated items, filter out any whose normalized name is in the archived set
- When merging with an existing item, also preserve `checked` state: `checked: existingItem.checked ?? newItem.checked`
- Update both call sites (init and meal-change effect) to pass the archived names set

