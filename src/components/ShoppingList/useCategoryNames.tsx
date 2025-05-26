
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

export function useCategoryNames() {
  const { toast } = useToast();
  const [customCategoryNames, setCustomCategoryNames] = useState<Record<string, string>>({});

  useEffect(() => {
    // Load custom category names from localStorage
    const savedCategoryNames = localStorage.getItem('mealPlannerCustomCategoryNames');
    console.log("useCategoryNames: Loading from localStorage:", savedCategoryNames);
    if (savedCategoryNames) {
      const parsed = JSON.parse(savedCategoryNames);
      console.log("useCategoryNames: Parsed category names:", parsed);
      setCustomCategoryNames(parsed);
    }
  }, []);

  // Save custom category names when they change
  useEffect(() => {
    console.log("useCategoryNames: Saving to localStorage:", customCategoryNames);
    localStorage.setItem('mealPlannerCustomCategoryNames', JSON.stringify(customCategoryNames));
  }, [customCategoryNames]);

  // Function to handle category name changes
  const handleCategoryNameChange = (oldName: string, newName: string) => {
    console.log("useCategoryNames: Updating category name from", oldName, "to", newName);
    
    setCustomCategoryNames(prev => {
      const updated = {
        ...prev,
        [oldName]: newName
      };
      console.log("useCategoryNames: New category names state:", updated);
      return updated;
    });
    
    toast({
      title: "Category Updated",
      description: `Category renamed to "${newName}"`,
    });
  };

  return {
    customCategoryNames,
    handleCategoryNameChange
  };
}
