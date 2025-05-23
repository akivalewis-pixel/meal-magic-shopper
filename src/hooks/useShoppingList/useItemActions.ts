
import { GroceryItem } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { sortGroceryItems, findMatchingArchivedItem, normalizeGroceryItem } from "./utils";

interface UseItemActionsProps {
  groceryItems: GroceryItem[];
  setGroceryItems: (items: GroceryItem[] | ((prev: GroceryItem[]) => GroceryItem[])) => void;
  archivedItems: GroceryItem[];
  setArchivedItems: (items: GroceryItem[] | ((prev: GroceryItem[]) => GroceryItem[])) => void;
  manualItems: GroceryItem[];
  setManualItems: (items: GroceryItem[] | ((prev: GroceryItem[]) => GroceryItem[])) => void;
}

export const useItemActions = ({
  groceryItems,
  setGroceryItems,
  archivedItems,
  setArchivedItems,
  manualItems,
  setManualItems
}: UseItemActionsProps) => {
  const { toast } = useToast();

  const handleToggleGroceryItem = (id: string) => {
    const updatedItems = groceryItems.map((item) =>
      item.id === id ? { ...item, checked: !item.checked } : item
    );
    setGroceryItems(updatedItems);
  };

  const handleAddGroceryItem = (newItem: GroceryItem) => {
    // Check if this item was previously archived
    const matchingArchivedItem = findMatchingArchivedItem(newItem, archivedItems);

    if (matchingArchivedItem) {
      // Remove from archived items
      setArchivedItems(prev => 
        prev.filter(item => item.id !== matchingArchivedItem.id)
      );
      
      // Use some properties from the archived item
      newItem.category = matchingArchivedItem.category;
      if (matchingArchivedItem.store) newItem.store = matchingArchivedItem.store;
    }
    
    // Normalize the new item
    const normalizedItem = normalizeGroceryItem(newItem);
    
    // Add to manual items
    setManualItems(prev => [...prev, normalizedItem]);
    
    // Add to grocery items directly to ensure immediate visibility
    setGroceryItems(prevItems => sortGroceryItems([...prevItems, normalizedItem]));
    
    toast({
      title: "Item Added",
      description: `${normalizedItem.name} has been added to your shopping list`,
    });
  };
  
  const handleArchiveItem = (id: string) => {
    const itemToArchive = groceryItems.find(item => item.id === id);
    if (!itemToArchive) return;
    
    // Add the item to the archive with checked state
    setArchivedItems(prev => [...prev, {...itemToArchive, checked: true}]);
    
    // Remove the item from the current list
    setGroceryItems(prev => prev.filter(item => item.id !== id));
    
    // Remove from manual items if it exists there
    setManualItems(prev => prev.filter(item => item.id !== id));
    
    toast({
      title: "Item Archived",
      description: `${itemToArchive.name} has been moved to archive`,
    });
  };

  const resetShoppingList = () => {
    // Archive all current items
    const currentTime = Date.now();
    const itemsToArchive = groceryItems.map(item => ({
      ...item,
      checked: true,
      id: `archived-${currentTime}-${item.id}` // Ensure unique IDs in archive
    }));
    
    setArchivedItems(prev => [...prev, ...itemsToArchive]);
    
    // Clear current lists
    setGroceryItems([]);
    setManualItems([]);
    
    toast({
      title: "Shopping List Reset",
      description: `${itemsToArchive.length} items have been archived and the shopping list has been cleared.`,
    });
  };

  return {
    handleToggleGroceryItem,
    handleAddGroceryItem,
    handleArchiveItem,
    resetShoppingList
  };
};
