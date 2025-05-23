
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { 
  GroceryItem,
  Meal
} from "@/types";
import { generateShoppingList } from "@/utils/groceryUtils";

export function useShoppingList(meals: Meal[], pantryItems: string[] = []) {
  const { toast } = useToast();
  const [groceryItems, setGroceryItems] = useState<GroceryItem[]>([]);
  const [archivedItems, setArchivedItems] = useState<GroceryItem[]>([]);
  const [manualItems, setManualItems] = useState<GroceryItem[]>([]);
  const [availableStores, setAvailableStores] = useState<string[]>([
    "Any Store", "Supermarket", "Farmers Market", "Specialty Store"
  ]);

  // Initialize with saved data
  useEffect(() => {
    const savedStores = localStorage.getItem('mealPlannerStores');
    const savedArchivedItems = localStorage.getItem('mealPlannerArchivedItems');
    const savedManualItems = localStorage.getItem('mealPlannerManualItems');
    
    const initialStores = savedStores ? JSON.parse(savedStores) : ["Any Store", "Supermarket", "Farmers Market", "Specialty Store"];
    const initialArchivedItems = savedArchivedItems ? JSON.parse(savedArchivedItems) : [];
    const initialManualItems = savedManualItems ? JSON.parse(savedManualItems) : [];
    
    setAvailableStores(initialStores);
    setArchivedItems(initialArchivedItems);
    setManualItems(initialManualItems);
  }, []);

  // Update shopping list when meals, pantry, or manual items change
  useEffect(() => {
    let shoppingList: GroceryItem[] = [];
    
    if (meals.length > 0) {
      // Only include meals that have a day assigned
      const activeMeals = meals.filter(meal => meal.day && meal.day !== "");
      shoppingList = generateShoppingList(activeMeals, pantryItems, []);
    }
    
    // Add manually added items that aren't in the list already
    manualItems.forEach(manualItem => {
      const existingItem = shoppingList.find(item => 
        item.name.toLowerCase() === manualItem.name.toLowerCase() && 
        (!item.meal || item.meal === manualItem.meal)
      );
      
      if (!existingItem) {
        shoppingList.push(manualItem);
      }
    });
    
    // Filter out any items that are in the archived list
    const filteredShoppingList = shoppingList.filter(item => 
      !archivedItems.some(archivedItem => 
        archivedItem.name.toLowerCase() === item.name.toLowerCase() && 
        (!item.meal || archivedItem.meal === item.meal)
      )
    );
    
    setGroceryItems(sortGroceryItems(filteredShoppingList));
  }, [meals, pantryItems, archivedItems, manualItems]);

  // Sort grocery items by store and category
  const sortGroceryItems = (items: GroceryItem[]): GroceryItem[] => {
    return [...items].sort((a, b) => {
      // First sort by store (with "Unassigned" at the end)
      const storeA = a.store || "Unassigned";
      const storeB = b.store || "Unassigned";
      
      if (storeA !== storeB) {
        if (storeA === "Unassigned") return 1;
        if (storeB === "Unassigned") return -1;
        return storeA.localeCompare(storeB);
      }
      
      // Then by department if available
      if (a.department && b.department && a.department !== b.department) {
        return a.department.localeCompare(b.department);
      }
      
      // Finally by category
      return a.category.localeCompare(b.category);
    });
  };

  // Save to localStorage when state changes
  useEffect(() => {
    localStorage.setItem('mealPlannerStores', JSON.stringify(availableStores));
    localStorage.setItem('mealPlannerArchivedItems', JSON.stringify(archivedItems));
    localStorage.setItem('mealPlannerManualItems', JSON.stringify(manualItems));
  }, [availableStores, archivedItems, manualItems]);

  const handleToggleGroceryItem = (id: string) => {
    const updatedItems = groceryItems.map((item) =>
      item.id === id ? { ...item, checked: !item.checked } : item
    );
    setGroceryItems(updatedItems);
  };

  const handleUpdateGroceryItem = (updatedItem: GroceryItem) => {
    console.log("Updating grocery item:", updatedItem);
    
    // Update in groceryItems - this triggers resorting
    setGroceryItems(prevItems => {
      const newItems = prevItems.map(item =>
        item.id === updatedItem.id ? updatedItem : item
      );
      // Re-sort after update to ensure stores are properly grouped
      return sortGroceryItems(newItems);
    });
    
    // Update in manualItems if it exists there
    setManualItems(prevItems => {
      const existingIndex = prevItems.findIndex(item => item.id === updatedItem.id);
      if (existingIndex >= 0) {
        const newItems = [...prevItems];
        newItems[existingIndex] = updatedItem;
        return newItems;
      }
      return prevItems;
    });

    // If this is a store update, display a toast
    if (updatedItem.store) {
      toast({
        title: "Store Updated",
        description: `${updatedItem.name} assigned to ${updatedItem.store}`,
      });
    }
  };

  const handleUpdateMultipleGroceryItems = (items: GroceryItem[], updates: Partial<GroceryItem>) => {
    console.log("Updating multiple grocery items:", items.length, "with updates:", updates);
    
    // Create a map of item IDs to updates for efficient lookup
    const itemIdsToUpdate = new Set(items.map(item => item.id));
    
    // Update groceryItems
    setGroceryItems(prevItems => {
      const newItems = prevItems.map(item => {
        if (itemIdsToUpdate.has(item.id)) {
          return { ...item, ...updates };
        }
        return item;
      });
      // Re-sort after bulk update
      return sortGroceryItems(newItems);
    });
    
    // Update manualItems if any of the updated items exist there
    setManualItems(prevItems => {
      const newItems = prevItems.map(item => {
        if (itemIdsToUpdate.has(item.id)) {
          return { ...item, ...updates };
        }
        return item;
      });
      return newItems;
    });

    // Show success toast
    const updateType = updates.store ? 'store' : updates.category ? 'category' : 'items';
    toast({
      title: "Items Updated",
      description: `${items.length} item${items.length > 1 ? 's' : ''} ${updateType} updated successfully`,
    });
  };

  const handleUpdateStores = (stores: string[]) => {
    setAvailableStores(stores);
    toast({
      title: "Stores Updated",
      description: `Your store list has been updated`,
    });
  };
  
  const handleAddGroceryItem = (newItem: GroceryItem) => {
    // Check if this item was previously archived
    const matchingArchivedItem = archivedItems.find(item => 
      item.name.toLowerCase() === newItem.name.toLowerCase()
    );

    if (matchingArchivedItem) {
      // Remove from archived items
      setArchivedItems(prev => 
        prev.filter(item => item.id !== matchingArchivedItem.id)
      );
      
      // Use some properties from the archived item
      newItem.category = matchingArchivedItem.category;
      if (matchingArchivedItem.store) newItem.store = matchingArchivedItem.store;
    }
    
    // Add to manual items
    setManualItems(prev => [...prev, newItem]);
    
    // Add to grocery items directly to ensure immediate visibility
    setGroceryItems(prevItems => sortGroceryItems([...prevItems, newItem]));
    
    toast({
      title: "Item Added",
      description: `${newItem.name} has been added to your shopping list`,
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

  // Function to reset the shopping list
  const resetShoppingList = () => {
    setManualItems([]);
    
    toast({
      title: "Shopping List Reset",
      description: "Your shopping list has been reset.",
    });
  };

  return {
    groceryItems,
    availableStores,
    handleToggleGroceryItem,
    handleUpdateGroceryItem,
    handleUpdateMultipleGroceryItems,
    handleUpdateStores,
    handleAddGroceryItem,
    handleArchiveItem,
    archivedItems,
    resetShoppingList
  };
}
