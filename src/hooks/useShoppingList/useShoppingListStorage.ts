
import { useState, useEffect } from "react";
import { GroceryItem } from "@/types";

export const useShoppingListStorage = () => {
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

  // Save to localStorage when state changes
  useEffect(() => {
    localStorage.setItem('mealPlannerStores', JSON.stringify(availableStores));
    localStorage.setItem('mealPlannerArchivedItems', JSON.stringify(archivedItems));
    localStorage.setItem('mealPlannerManualItems', JSON.stringify(manualItems));
  }, [availableStores, archivedItems, manualItems]);

  return {
    archivedItems,
    setArchivedItems,
    manualItems,
    setManualItems,
    availableStores,
    setAvailableStores
  };
};
