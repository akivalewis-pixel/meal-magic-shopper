import { useEffect, useRef } from "react";
import { GroceryItem, GroceryCategory } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/utils/logger";

interface UseShoppingListRealtimeProps {
  setAllItems: React.Dispatch<React.SetStateAction<GroceryItem[]>>;
  isInitializedRef: React.MutableRefObject<boolean>;
}

export function useShoppingListRealtime({
  setAllItems,
  isInitializedRef,
}: UseShoppingListRealtimeProps) {
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  useEffect(() => {
    let cancelled = false;

    const setup = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || cancelled) return;

      // Subscribe to real-time changes on shopping_list_items
      const channel = supabase
        .channel("shopping-list-realtime")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "shopping_list_items",
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            if (!isInitializedRef.current) return;

            const toGroceryItem = (row: any): GroceryItem => ({
              id: row.is_manual ? `manual-${row.id}` : row.id,
              name: row.name,
              quantity: row.quantity || "",
              category: (row.category || "other") as GroceryCategory,
              store: row.store || "Unassigned",
              department: row.department || undefined,
              meal: row.meal || undefined,
              checked: row.checked || false,
              __updateTimestamp: new Date(row.updated_at || row.created_at).getTime(),
            });

            if (payload.eventType === "UPDATE") {
              const updated = toGroceryItem(payload.new);
              logger.log("Realtime UPDATE:", updated.name, "checked:", updated.checked);
              setAllItems((prev) =>
                prev.map((item) => (item.id === updated.id ? { ...item, checked: updated.checked, __updateTimestamp: updated.__updateTimestamp } : item))
              );
            }
            // INSERT and DELETE are handled by the sync cycle already
          }
        )
        .subscribe();

      channelRef.current = channel;
    };

    setup();

    return () => {
      cancelled = true;
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [setAllItems, isInitializedRef]);
}
