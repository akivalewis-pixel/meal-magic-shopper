
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

export function useCategoryNames() {
  const { toast } = useToast();
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
    console.log("Updating category name from", oldName, "to", newName);
    
    setCustomCategoryNames(prev => ({
      ...prev,
      [oldName]: newName
    }));
    
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
