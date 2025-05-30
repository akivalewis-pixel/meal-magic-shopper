
import { useCallback } from "react";
import { Meal, GroceryItem } from "@/types";
import { generateFullPrintContent } from "./printContentGenerator";

export const usePrintLogic = () => {
  const handlePrint = useCallback((
    meals: Meal[], 
    groceryItems: GroceryItem[], 
    getCurrentItems?: () => GroceryItem[]
  ) => {
    console.log("PrintButton: Starting print process...");
    
    let currentItems: GroceryItem[] = [];
    
    if (getCurrentItems) {
      // Get the absolute latest state
      currentItems = getCurrentItems();
      console.log("PrintButton: Got", currentItems.length, "total items from getCurrentItems");
      
      // Filter out checked items only
      currentItems = currentItems.filter(item => !item.checked);
      console.log("PrintButton: After filtering checked items:", currentItems.length, "active items");
    } else {
      // Fallback to groceryItems if getCurrentItems not available
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

    if (currentItems.length === 0) {
      console.log("PrintButton: No items to print - list is empty");
    } else {
      console.log("PrintButton: Proceeding to print", currentItems.length, "items");
    }
  }, []);

  return { handlePrint };
};
