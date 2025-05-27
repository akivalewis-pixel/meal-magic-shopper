
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
`;
