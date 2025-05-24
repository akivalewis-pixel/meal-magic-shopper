
import { useCallback } from "react";
import { GroceryItem } from "@/types";
import { useToast } from "@/hooks/use-toast";

interface UseShoppingListActionsProps {
  allItems: GroceryItem[];
  setAllItems: React.Dispatch<React.SetStateAction<GroceryItem[]>>;
  archivedItems: GroceryItem[];
  setArchivedItems: React.Dispatch<React.SetStateAction<GroceryItem[]>>;
  storeAssignments: React.MutableRefObject<Map<string, string>>;
  saveToLocalStorage: () => void;
  setAvailableStores: React.Dispatch<React.SetStateAction<string[]>>;
}

export function useShoppingListActions({
  allItems,
  setAllItems,
  archivedItems,
  setArchivedItems,
  storeAssignments,
  saveToLocalStorage,
  setAvailableStores
}: UseShoppingListActionsProps) {
  const { toast } = useToast();

  const updateItem = useCallback((updatedItem: GroceryItem) => {
    // Update store assignment persistence immediately
    if (updatedItem.store && updatedItem.store !== "Unassigned") {
      storeAssignments.current.set(updatedItem.name.toLowerCase(), updatedItem.store);
    } else if (updatedItem.store === "Unassigned") {
      storeAssignments.current.delete(updatedItem.name.toLowerCase());
    }
    
    // Update the actual state
    setAllItems(prevItems => {
      return prevItems.map(item => {
        if (item.id === updatedItem.id) {
          return {
            ...updatedItem,
            __updateTimestamp: Date.now()
          };
        }
        return item;
      });
    });

    // Debounced save
    setTimeout(saveToLocalStorage, 100);
  }, [setAllItems, storeAssignments, saveToLocalStorage]);

  const toggleItem = useCallback((id: string) => {
    setAllItems(prev => 
      prev.map(item => 
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    );
  }, [setAllItems]);

  const archiveItem = useCallback((id: string) => {
    const item = allItems.find(i => i.id === id);
    if (!item) return;

    setArchivedItems(prev => [...prev, { ...item, checked: true }]);
    setAllItems(prev => prev.filter(i => i.id !== id));
    
    toast({
      title: "Item Archived",
      description: `${item.name} moved to archive`,
    });
  }, [allItems, setArchivedItems, setAllItems, toast]);

  const addItem = useCallback((newItem: GroceryItem) => {
    const itemWithId = {
      ...newItem,
      id: `manual-${newItem.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
      store: newItem.store || "Unassigned",
      source: 'manual' as const
    };
    
    setAllItems(prev => [...prev, itemWithId]);
    
    toast({
      title: "Item Added",
      description: `${newItem.name} added to shopping list`,
    });
  }, [setAllItems, toast]);

  const updateStores = useCallback((newStores: string[]) => {
    setAvailableStores(newStores);
    
    // Update items that have invalid stores
    setAllItems(prev => 
      prev.map(item => {
        if (item.store && !newStores.includes(item.store)) {
          return { ...item, store: "Unassigned" };
        }
        return item;
      })
    );
    
    toast({
      title: "Stores Updated",
      description: "Store list has been updated",
    });
  }, [setAvailableStores, setAllItems, toast]);

  const resetList = useCallback(() => {
    const itemsToArchive = allItems.map(item => ({
      ...item,
      checked: true,
      id: `archived-${Date.now()}-${item.id}`
    }));
    
    setArchivedItems(prev => [...prev, ...itemsToArchive]);
    setAllItems([]);
    
    toast({
      title: "List Reset",
      description: `${itemsToArchive.length} items archived`,
    });
  }, [allItems, setArchivedItems, setAllItems, toast]);

  return {
    updateItem,
    toggleItem,
    archiveItem,
    addItem,
    updateStores,
    resetList
  };
}
