
import React from "react";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { Meal, GroceryItem } from "@/types";
import { daysOfWeek } from "@/utils/mealPlannerUtils";

interface PrintButtonProps {
  meals: Meal[];
  groceryItems: GroceryItem[];
}

export const PrintButton = ({ meals, groceryItems }: PrintButtonProps) => {
  const handlePrint = () => {
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    
    if (!printWindow) {
      alert('Please allow popups for this website to print');
      return;
    }
    
    // Set up the HTML content for the print window
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Weekly Meal Plan & Shopping List</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
          }
          h1, h2, h3 {
            color: #2e7d32;
            margin-top: 1em;
          }
          .meal-day {
            page-break-inside: avoid;
            margin-bottom: 15px;
            padding-bottom: 15px;
            border-bottom: 1px solid #eee;
          }
          .page-break {
            page-break-before: always;
          }
          .category {
            margin-top: 20px;
            border-bottom: 1px solid #ccc;
          }
          .item {
            margin: 5px 0;
            padding: 3px 0;
          }
          .day-title {
            font-weight: bold;
            color: #333;
          }
          .meal-title {
            font-weight: bold;
          }
          .notes {
            font-style: italic;
            color: #555;
          }
        </style>
      </head>
      <body>
        <h1>Weekly Meal Plan</h1>
    `);

    // Add meal plan content
    daysOfWeek.forEach(day => {
      const meal = meals.find(m => m.day === day);
      
      printWindow.document.write(`
        <div class="meal-day">
          <h3 class="day-title">${day}</h3>
      `);
      
      if (meal) {
        printWindow.document.write(`
          <p class="meal-title">${meal.title}</p>
        `);
        
        if (meal.recipeUrl) {
          printWindow.document.write(`
            <p>Recipe: <a href="${meal.recipeUrl}" target="_blank">${meal.recipeUrl}</a></p>
          `);
        }
        
        if (meal.notes) {
          printWindow.document.write(`
            <p class="notes">Notes: ${meal.notes}</p>
          `);
        }
        
        printWindow.document.write(`
          <p>Dietary: ${meal.dietaryPreferences.join(', ')}</p>
        `);
      } else {
        printWindow.document.write(`
          <p>No meal planned</p>
        `);
      }
      
      printWindow.document.write(`</div>`);
    });

    // Add page break and shopping list
    printWindow.document.write(`
      <div class="page-break"></div>
      <h1>Shopping List</h1>
    `);

    // Group grocery items by category
    const itemsByCategory = groceryItems.reduce((acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = [];
      }
      acc[item.category].push(item);
      return acc;
    }, {} as Record<string, GroceryItem[]>);

    // Print each category and its items
    Object.entries(itemsByCategory).forEach(([category, items]) => {
      // Capitalize the category name
      const categoryName = category.charAt(0).toUpperCase() + category.slice(1);
      
      printWindow.document.write(`
        <div class="category">
          <h3>${categoryName}</h3>
      `);
      
      items.forEach(item => {
        printWindow.document.write(`
          <div class="item">
            <span>${item.name}</span>
            <span> - ${item.quantity}</span>
            ${item.meal ? `<span> (${item.meal})</span>` : ''}
          </div>
        `);
      });
      
      printWindow.document.write(`</div>`);
    });

    // Close the HTML
    printWindow.document.write(`
        </body>
      </html>
    `);

    printWindow.document.close();
    
    // Trigger print when content is loaded
    printWindow.onload = () => {
      printWindow.print();
    };
  };

  return (
    <Button 
      onClick={handlePrint} 
      variant="outline" 
      className="print-button flex items-center gap-2"
    >
      <Printer size={18} />
      <span>Print Menu & Shopping List</span>
    </Button>
  );
};
