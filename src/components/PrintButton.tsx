
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
            line-height: 1.4;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 10px;
            font-size: 11px;
          }
          h1 {
            color: #2e7d32;
            margin-top: 0.5em;
            margin-bottom: 0.5em;
            font-size: 18px;
            text-align: center;
          }
          h2, h3 {
            color: #2e7d32;
            margin-top: 0.5em;
            margin-bottom: 0.5em;
            font-size: 14px;
          }
          .meal-plan-grid {
            display: grid;
            grid-template-columns: repeat(7, 1fr);
            gap: 5px;
            margin-bottom: 10px;
          }
          .meal-day {
            break-inside: avoid;
            padding: 5px;
            border: 1px solid #eee;
            border-radius: 4px;
          }
          .page-break {
            page-break-before: always;
          }
          .category {
            margin-top: 10px;
            padding-bottom: 3px;
            border-bottom: 1px solid #ccc;
          }
          .grocery-columns {
            column-count: 2;
            column-gap: 20px;
          }
          .item {
            margin: 2px 0;
            padding: 1px 0;
            break-inside: avoid;
          }
          .day-title {
            font-weight: bold;
            color: #333;
            font-size: 12px;
            margin: 0;
            padding: 0;
            text-align: center;
          }
          .meal-title {
            font-weight: bold;
            margin: 3px 0;
          }
          .notes {
            font-style: italic;
            color: #555;
            margin: 2px 0;
          }
          a {
            color: #1a73e8;
            text-decoration: none;
            font-size: 10px;
          }
          p {
            margin: 2px 0;
          }
        </style>
      </head>
      <body>
        <h1>NomNom Navigator: Weekly Meal Plan</h1>
    `);

    // Add meal plan content
    printWindow.document.write('<div class="meal-plan-grid">');
    
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
            <p>Recipe: <a href="${meal.recipeUrl}" target="_blank">${meal.recipeUrl.substring(0, 25)}${meal.recipeUrl.length > 25 ? '...' : ''}</a></p>
          `);
        }
        
        if (meal.notes) {
          const notesText = meal.notes.length > 50 
            ? `${meal.notes.substring(0, 50)}...` 
            : meal.notes;
          printWindow.document.write(`
            <p class="notes">${notesText}</p>
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
    
    printWindow.document.write('</div>');

    // Add page break and shopping list
    printWindow.document.write(`
      <div class="page-break"></div>
      <h1>NomNom Navigator: Shopping List</h1>
    `);

    // Group grocery items by category
    const itemsByCategory = groceryItems.reduce((acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = [];
      }
      acc[item.category].push(item);
      return acc;
    }, {} as Record<string, GroceryItem[]>);

    // Create two columns for shopping list
    printWindow.document.write('<div class="grocery-columns">');

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
    
    printWindow.document.write('</div>'); // Close grocery-columns

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

