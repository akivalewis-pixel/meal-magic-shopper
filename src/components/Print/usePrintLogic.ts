
import { useCallback } from "react";
import { Meal, GroceryItem } from "@/types";
import { generateFullPrintContent } from "./printContentGenerator";
import { shoppingListStateRef } from "@/hooks/useShoppingList";

export const usePrintLogic = () => {
  const handlePrint = useCallback((
    meals: Meal[], 
    groceryItems: GroceryItem[], 
    getCurrentItems?: () => GroceryItem[]
  ) => {
    console.log("PrintButton: Starting print process...");
    
    let currentItems: GroceryItem[] = [];
    
    // Try to get from global state reference first (most reliable)
    if (shoppingListStateRef.currentItems.length > 0) {
      currentItems = shoppingListStateRef.currentItems.filter(item => !item.checked);
      console.log("PrintButton: Using global state reference with", currentItems.length, "items");
    } else if (getCurrentItems) {
      currentItems = getCurrentItems();
      console.log("PrintButton: Got", currentItems.length, "items from getCurrentItems");
    } else {
      currentItems = groceryItems.filter(item => !item.checked);
      console.log("PrintButton: Using groceryItems fallback, found", currentItems.length, "active items");
    }
    
    console.log("PrintButton: Items to print:", currentItems.map(item => ({
      id: item.id,
      name: item.name,
      checked: item.checked,
      store: item.store || "Unassigned",
      category: item.category,
      quantity: item.quantity
    })));

    const printWindow = window.open('', '_blank');
    
    if (!printWindow) {
      alert('Please allow popups for this website to print');
      return;
    }

    const htmlContent = generateFullPrintContent(meals, currentItems);
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
    printWindow.onload = () => {
      printWindow.print();
    };

    console.log("PrintButton: Proceeding to print", currentItems.length, "items");
  }, []);

  return { handlePrint };
};
