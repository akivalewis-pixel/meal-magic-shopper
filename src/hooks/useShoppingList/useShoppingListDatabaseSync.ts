import { useCallback, useEffect, useRef } from "react";
import { GroceryItem, GroceryCategory } from "@/types";
import { supabase } from "@/integrations/supabase/client";
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

      // Delete all existing items for this user to start fresh
      const { error: deleteError } = await supabase
        .from('shopping_list_items')
        .delete()
        .eq('user_id', user.user.id);

      if (deleteError) {
        console.error('Error deleting existing items:', deleteError);
        return;
      }

      // Prepare items for database insertion
      const itemsToInsert = [
        ...currentAllItems.map(item => ({
          id: item.id.startsWith('manual-') ? item.id.replace('manual-', '') : item.id,
          user_id: user.user.id,
          name: item.name,
          quantity: item.quantity || null,
          category: item.category,
          store: item.store,
          department: item.department || null,
          meal: item.meal || null,
          checked: false,
          is_manual: item.id.startsWith('manual-'),
          created_at: item.__updateTimestamp ? new Date(item.__updateTimestamp).toISOString() : new Date().toISOString(),
          updated_at: new Date().toISOString()
        })),
        ...currentArchivedItems.map(item => ({
          id: item.id.startsWith('manual-') ? item.id.replace('manual-', '') : item.id,
          user_id: user.user.id,
          name: item.name,
          quantity: item.quantity || null,
          category: item.category,
          store: item.store,
          department: item.department || null,
          meal: item.meal || null,
          checked: true,
          is_manual: item.id.startsWith('manual-'),
          created_at: item.__updateTimestamp ? new Date(item.__updateTimestamp).toISOString() : new Date().toISOString(),
          updated_at: new Date().toISOString()
        }))
      ];

      if (itemsToInsert.length > 0) {
        const { error: insertError } = await supabase
          .from('shopping_list_items')
          .insert(itemsToInsert);

        if (insertError) {
          console.error('Error inserting items:', insertError);
          toast({
            title: "Sync Error",
            description: "Failed to sync shopping list to cloud",
            variant: "destructive",
          });
          return;
        }

        console.log(`Successfully synced ${itemsToInsert.length} items to database`);
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

  // Auto-sync to database when items change (debounced)
  useEffect(() => {
    if (!isInitializedRef.current) return;

    const now = Date.now();
    if (now - lastSyncRef.current < 5000) return; // Debounce 5 seconds

    const timeoutId = setTimeout(() => {
      saveToDatabase(allItems, archivedItems);
    }, 2000); // Wait 2 seconds after last change

    return () => clearTimeout(timeoutId);
  }, [allItems, archivedItems, saveToDatabase, isInitializedRef]);

  return {
    loadFromDatabase,
    saveToDatabase
  };
}