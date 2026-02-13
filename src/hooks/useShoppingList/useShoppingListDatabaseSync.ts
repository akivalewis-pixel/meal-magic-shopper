import { useCallback, useEffect, useRef } from "react";
import { GroceryItem, GroceryCategory } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from 'uuid';
import { useToast } from "@/hooks/use-toast";

interface UseShoppingListDatabaseSyncProps {
  allItems: GroceryItem[];
  archivedItems: GroceryItem[];
  setAllItems: (items: GroceryItem[]) => void;
  setArchivedItems: (items: GroceryItem[]) => void;
  isInitializedRef: React.MutableRefObject<boolean>;
}

export function useShoppingListDatabaseSync({
  allItems,
  archivedItems,
  setAllItems,
  setArchivedItems,
  isInitializedRef
}: UseShoppingListDatabaseSyncProps) {
  const { toast } = useToast();
  const lastSyncRef = useRef<number>(0);
  const syncInProgressRef = useRef<boolean>(false);

  // Load items from database on initialization
  const loadFromDatabase = useCallback(async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        console.log("No authenticated user, skipping database load");
        return { allItems: [], archivedItems: [] };
      }

      console.log("Loading shopping list items from database...");

      const { data: dbItems, error } = await supabase
        .from('shopping_list_items')
        .select('*')
        .eq('user_id', user.user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading from database:', error);
        return { allItems: [], archivedItems: [] };
      }

      // Convert database items to GroceryItem format
      const activeItems: GroceryItem[] = [];
      const checkedItems: GroceryItem[] = [];

      dbItems?.forEach(item => {
        const groceryItem: GroceryItem = {
          id: item.is_manual ? `manual-${item.id}` : item.id,
          name: item.name,
          quantity: item.quantity || '',
          category: (item.category || 'other') as GroceryCategory,
          store: item.store || 'Unassigned',
          department: item.department || undefined,
          meal: item.meal || undefined,
          checked: item.checked || false,
          __updateTimestamp: new Date(item.updated_at || item.created_at).getTime()
        };

        if (item.checked) {
          checkedItems.push(groceryItem);
        } else {
          activeItems.push(groceryItem);
        }
      });

      console.log(`Loaded ${activeItems.length} active items and ${checkedItems.length} archived items from database`);
      
      return { 
        allItems: activeItems, 
        archivedItems: checkedItems 
      };
    } catch (error) {
      console.error('Error loading from database:', error);
      return { allItems: [], archivedItems: [] };
    }
  }, []);

  // Save items to database
  const saveToDatabase = useCallback(async (currentAllItems: GroceryItem[], currentArchivedItems: GroceryItem[]) => {
    if (syncInProgressRef.current) {
      console.log("Sync already in progress, skipping");
      return;
    }

    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        console.log("No authenticated user, skipping database save");
        return;
      }

      syncInProgressRef.current = true;
      console.log("Saving shopping list items to database...");

      // We no longer delete-all first. Instead we upsert current items,
      // then selectively delete items that are no longer in the set.

      // Prepare items for database insertion
      // Always generate a valid UUID and ensure there are no duplicates within the batch
      const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      const isValidUuid = (value: string | undefined | null) =>
        !!value && uuidRegex.test(value);

      const extractPreferredDbId = (item: GroceryItem) => {
        // Manual items are stored in DB without the "manual-" prefix
        if (item.id.startsWith("manual-")) return item.id.slice("manual-".length).toLowerCase();

        // Some legacy IDs might contain a UUID within a prefixed string (e.g. archived-...-<uuid>)
        const match = item.id.match(
          /[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/i
        );
        return match?.[0]?.toLowerCase() ?? item.id.toLowerCase();
      };

      const usedIds = new Set<string>();
      const getUniqueDbId = (preferred?: string) => {
        const normalizedPreferred = preferred?.toLowerCase();
        let id = isValidUuid(normalizedPreferred) ? normalizedPreferred! : uuidv4();
        while (usedIds.has(id)) id = uuidv4();
        usedIds.add(id);
        return id;
      };

      const toDbRow = (item: GroceryItem, checked: boolean) => {
        const preferredId = extractPreferredDbId(item);
        const dbId = getUniqueDbId(preferredId);

        return {
          id: dbId,
          user_id: user.user.id,
          name: item.name,
          quantity: item.quantity || null,
          category: item.category,
          store: item.store,
          department: item.department || null,
          meal: item.meal || null,
          checked,
          is_manual: item.id.startsWith("manual-"),
          created_at: item.__updateTimestamp
            ? new Date(item.__updateTimestamp).toISOString()
            : new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
      };

      const itemsToInsert = [
        ...currentAllItems.map((item) => toDbRow(item, false)),
        ...currentArchivedItems.map((item) => toDbRow(item, true)),
      ];

      if (itemsToInsert.length > 0) {
        // Dedupe by id (case-insensitive) to prevent duplicates in the same batch
        const seenIds = new Set<string>();
        const dedupedItems = itemsToInsert.filter(item => {
          const lowerId = item.id.toLowerCase();
          if (seenIds.has(lowerId)) return false;
          seenIds.add(lowerId);
          return true;
        });

        // Use upsert to handle conflicts gracefully (multi-tab/multi-device scenarios)
        const { error: upsertError } = await supabase
          .from('shopping_list_items')
          .upsert(dedupedItems, { onConflict: 'id' });

        if (upsertError) {
          console.error('Error upserting items:', upsertError.code, upsertError.message, upsertError);
          toast({
            title: "Sync Error",
            description: "Failed to sync shopping list to cloud",
            variant: "destructive",
          });
          return;
        }

        console.log(`Successfully upserted ${dedupedItems.length} items to database`);

        // Now delete items that are no longer in the current set
        const currentIds = dedupedItems.map(item => item.id);
        if (currentIds.length > 0) {
          const { error: deleteError } = await supabase
            .from('shopping_list_items')
            .delete()
            .eq('user_id', user.user.id)
            .not('id', 'in', `(${currentIds.join(',')})`);

          if (deleteError) {
            console.error('Error cleaning up old items:', deleteError);
          }
        }
      } else {
        // No items at all — delete everything
        await supabase
          .from('shopping_list_items')
          .delete()
          .eq('user_id', user.user.id);
      }

      lastSyncRef.current = Date.now();
    } catch (error) {
      console.error('Error saving to database:', error);
      toast({
        title: "Sync Error", 
        description: "Failed to sync shopping list to cloud",
        variant: "destructive",
      });
    } finally {
      syncInProgressRef.current = false;
    }
  }, [toast]);

  // Auto-sync to database when items change (proper debounce — always fires after last change)
  useEffect(() => {
    if (!isInitializedRef.current) return;

    const timeoutId = setTimeout(() => {
      saveToDatabase(allItems, archivedItems);
    }, 3000); // 3 second debounce after last change

    return () => clearTimeout(timeoutId);
  }, [allItems, archivedItems, saveToDatabase, isInitializedRef]);

  return {
    loadFromDatabase,
    saveToDatabase
  };
}