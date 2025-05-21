
import { useState, useEffect } from "react";

export function useCategoryNames() {
  const [customCategoryNames, setCustomCategoryNames] = useState<Record<string, string>>({});

  useEffect(() => {
    // Load custom category names from localStorage
    const savedCategoryNames = localStorage.getItem('mealPlannerCustomCategoryNames');
    if (savedCategoryNames) {
      setCustomCategoryNames(JSON.parse(savedCategoryNames));
    }
  }, []);

  // Save custom category names when they change
  useEffect(() => {
    localStorage.setItem('mealPlannerCustomCategoryNames', JSON.stringify(customCategoryNames));
  }, [customCategoryNames]);

  // Function to handle category name changes
  const handleCategoryNameChange = (oldName: string, newName: string) => {
    setCustomCategoryNames(prev => ({
      ...prev,
      [oldName]: newName
    }));
  };

  return {
    customCategoryNames,
    handleCategoryNameChange
  };
}
