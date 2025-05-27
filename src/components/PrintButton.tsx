
import React from "react";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { Meal, GroceryItem } from "@/types";
import { daysOfWeek } from "@/utils/constants";

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
    
    // Get the most current active items (force fresh data)
    const activeItems = groceryItems.filter(item => {
      const isActive = !item.checked;
      console.log(`PrintButton: Item "${item.name}" - checked: ${item.checked}, store: ${item.store}, quantity: ${item.quantity}, category: ${item.category}, isActive: ${isActive}`);
      return isActive;
    });
    
    console.log("PrintButton: Active items for printing:", activeItems.length);
    console.log("PrintButton: Active item details:", activeItems.map(item => ({ 
      id: item.id,
      name: item.name, 
      quantity: item.quantity,
      store: item.store,
      category: item.category,
      checked: item.checked 
    })));

    // Set up the HTML content for the print window
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Weekly Meal Plan & Shopping List</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.3;
            color: #333;
            margin: 0;
            padding: 5px;
            font-size: 10px;
          }
          h1 {
            color: #2e7d32;
            margin: 0;
            padding: 0;
            font-size: 14px;
            text-align: center;
          }
          h2, h3 {
            color: #2e7d32;
            margin: 5px 0;
            padding: 0;
            font-size: 12px;
          }
          .container {
            display: flex;
            flex-direction: column;
            page-break-inside: avoid;
          }
          .meal-plan-grid {
            display: grid;
            grid-template-columns: repeat(7, 1fr);
            gap: 2px;
            margin-bottom: 5px;
          }
          .meal-day {
            break-inside: avoid;
            padding: 3px;
            border: 1px solid #eee;
            border-radius: 2px;
          }
          .store-columns {
            display: flex;
            gap: 15px;
            font-size: 10px;
          }
          .store-column {
            flex: 1;
            min-width: 0;
            break-inside: avoid;
          }
          .item {
            margin: 1px 0;
            padding: 0;
            break-inside: avoid;
          }
          .day-title {
            font-weight: bold;
            color: #333;
            font-size: 11px;
            margin: 0;
            padding: 0;
            text-align: center;
          }
          .meal-title {
            font-weight: bold;
            margin: 2px 0;
          }
          .notes {
            font-style: italic;
            color: #555;
            margin: 1px 0;
          }
          a {
            color: #1a73e8;
            text-decoration: none;
            font-size: 8px;
          }
          p {
            margin: 1px 0;
          }
          .store-section {
            margin-bottom: 8px;
            break-inside: avoid;
          }
          .store-title {
            font-weight: bold;
            font-size: 11px;
            margin-bottom: 3px;
            padding-bottom: 1px;
            border-bottom: 1px solid #333;
          }
          .category-title {
            font-weight: bold;
            margin-top: 4px;
            margin-bottom: 2px;
            font-style: italic;
            font-size: 9px;
            color: #555;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Pantry Pilot: Weekly Meal Plan</h1>
    `);

    // Add meal plan content
    printWindow.document.write('<div class="meal-plan-grid">');
    
    daysOfWeek.forEach(day => {
      const dayMeals = meals.filter(m => m.day === day);
      
      printWindow.document.write(`
        <div class="meal-day">
          <h3 class="day-title">${day}</h3>
      `);
      
      if (dayMeals.length > 0) {
        dayMeals.forEach(meal => {
          printWindow.document.write(`
            <p class="meal-title">${meal.title}</p>
          `);
          
          if (meal.recipeUrl) {
            printWindow.document.write(`
              <p><a href="${meal.recipeUrl}" target="_blank">${meal.recipeUrl.substring(0, 15)}${meal.recipeUrl.length > 15 ? '...' : ''}</a></p>
            `);
          }
        });
      } else {
        printWindow.document.write(`
          <p>No meal planned</p>
        `);
      }
      
      printWindow.document.write(`</div>`);
    });
    
    printWindow.document.write('</div>');

    // Add shopping list below meal plan
    printWindow.document.write(`
      <h1>Pantry Pilot: Shopping List</h1>
    `);

    if (activeItems.length === 0) {
      printWindow.document.write('<p>No active items to print!</p>');
    } else {
      // Sort and group active items by store and category for printing
      // Use the most current data with all user modifications
      const sortedItems = [...activeItems].sort((a, b) => {
        // First sort by store (use current store assignments)
        const storeA = a.store || "Unassigned";
        const storeB = b.store || "Unassigned";
        
        if (storeA !== storeB) {
          if (storeA === "Unassigned") return 1;
          if (storeB === "Unassigned") return -1;
          return storeA.localeCompare(storeB);
        }
        
        // If same store, sort by category (use current category assignments)
        return a.category.localeCompare(b.category);
      });

      // Group items by store and then by category (using current assignments)
      const groupedByStore: Record<string, Record<string, GroceryItem[]>> = {};
      
      sortedItems.forEach(item => {
        const store = item.store || "Unassigned";
        const category = item.category;
        
        if (!groupedByStore[store]) {
          groupedByStore[store] = {};
        }
        
        if (!groupedByStore[store][category]) {
          groupedByStore[store][category] = [];
        }
        
        groupedByStore[store][category].push(item);
      });

      // Create store columns layout
      printWindow.document.write('<div class="store-columns">');

      // Get all stores for consistent column layout
      const storeNames = Object.keys(groupedByStore);
      
      storeNames.forEach(store => {
        const categories = groupedByStore[store];
        
        printWindow.document.write(`
          <div class="store-column">
            <div class="store-section">
              <div class="store-title">${store}</div>
        `);
        
        Object.entries(categories).forEach(([category, items]) => {
          // Capitalize category name for display
          const displayCategory = category.charAt(0).toUpperCase() + category.slice(1);
          
          printWindow.document.write(`
            <div class="category-title">${displayCategory}</div>
          `);
          
          items.forEach(item => {
            // Use the current name and quantity (with all user modifications)
            printWindow.document.write(`
              <div class="item">
                <span>${item.name}</span>
                ${item.quantity ? `<span> - ${item.quantity}</span>` : ''}
              </div>
            `);
          });
        });
        
        printWindow.document.write(`
            </div>
          </div>
        `);
      });
      
      printWindow.document.write('</div>'); // Close store-columns
    }

    // Close the HTML
    printWindow.document.write(`
        </div>
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
