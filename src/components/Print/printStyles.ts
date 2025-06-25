
export const getPrintStyles = () => `
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
    margin: 0 0 8px 0;
    padding: 0;
    font-size: 16px;
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
  
  /* Main layout: side by side */
  .main-layout {
    display: flex;
    gap: 20px;
    width: 100%;
    align-items: flex-start;
  }
  
  /* Left side - Meal Plan */
  .meal-plan-section {
    flex: 0 0 45%;
    min-width: 0;
  }
  
  .meal-plan-title {
    color: #2e7d32;
    margin: 0 0 10px 0;
    padding: 0;
    font-size: 18px;
    font-weight: bold;
    text-align: left;
  }
  
  .meal-plan-grid {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-bottom: 10px;
  }
  
  .meal-day {
    break-inside: avoid;
    padding: 6px;
    border: 1px solid #ddd;
    border-radius: 4px;
    background-color: #f9f9f9;
  }
  
  .day-title {
    font-weight: bold;
    color: #333;
    font-size: 14px;
    margin: 0 0 4px 0;
    padding: 0;
    text-align: left;
  }
  
  .meal-title {
    font-weight: bold;
    margin: 3px 0;
    font-size: 12px;
    color: #2e7d32;
  }
  
  /* Right side - Shopping List */
  .shopping-list-section {
    flex: 0 0 50%;
    min-width: 0;
  }
  
  .shopping-list-title {
    color: #2e7d32;
    margin: 0 0 10px 0;
    padding: 0;
    font-size: 18px;
    font-weight: bold;
    text-align: left;
  }
  
  .store-columns {
    display: flex;
    flex-direction: column;
    gap: 12px;
    font-size: 10px;
  }
  
  .store-column {
    break-inside: avoid;
  }
  
  .store-section {
    margin-bottom: 8px;
    break-inside: avoid;
  }
  
  .store-title {
    font-weight: bold;
    font-size: 12px;
    margin-bottom: 4px;
    padding-bottom: 2px;
    border-bottom: 1px solid #333;
    color: #2e7d32;
  }
  
  .category-title {
    font-weight: bold;
    margin-top: 6px;
    margin-bottom: 3px;
    font-style: italic;
    font-size: 10px;
    color: #555;
    text-transform: uppercase;
    text-decoration: underline;
  }
  
  .item {
    margin: 2px 0;
    padding: 0;
    break-inside: avoid;
    font-size: 10px;
  }
  
  .notes {
    font-style: italic;
    color: #555;
    margin: 2px 0;
    font-size: 10px;
  }
  
  a {
    color: #1a73e8;
    text-decoration: none;
    font-size: 9px;
  }
  
  p {
    margin: 2px 0;
  }
`;
