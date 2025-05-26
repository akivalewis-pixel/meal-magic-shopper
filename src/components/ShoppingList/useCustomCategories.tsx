
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

export function useCustomCategories() {
  const { toast } = useToast();
  const [customCategories, setCustomCategories] = useState<string[]>([]);

  useEffect(() => {
    // Load custom categories from localStorage
    const savedCategories = localStorage.getItem('mealPlannerCustomCategories');
    console.log("useCustomCategories: Loading from localStorage:", savedCategories);
    if (savedCategories) {
      const parsed = JSON.parse(savedCategories);
      console.log("useCustomCategories: Parsed categories:", parsed);
      setCustomCategories(parsed);
    }
  }, []);

  // Save custom categories when they change
  useEffect(() => {
    console.log("useCustomCategories: Saving to localStorage:", customCategories);
    localStorage.setItem('mealPlannerCustomCategories', JSON.stringify(customCategories));
  }, [customCategories]);

  const addCustomCategory = (categoryName: string) => {
    const trimmedName = categoryName.trim();
    if (!trimmedName) return;

    console.log("useCustomCategories: Adding category:", trimmedName);
    
    setCustomCategories(prev => {
      // Avoid duplicates (case-insensitive)
      const exists = prev.some(cat => cat.toLowerCase() === trimmedName.toLowerCase());
      if (exists) {
        toast({
          title: "Category Already Exists",
          description: `"${trimmedName}" is already in your categories`,
        });
        return prev;
      }
      
      const updated = [...prev, trimmedName];
      console.log("useCustomCategories: New categories state:", updated);
      
      toast({
        title: "Category Added",
        description: `"${trimmedName}" has been added to your categories`,
      });
      
      return updated;
    });
  };

  const removeCustomCategory = (categoryName: string) => {
    setCustomCategories(prev => {
      const updated = prev.filter(cat => cat !== categoryName);
      console.log("useCustomCategories: Removed category:", categoryName, "New state:", updated);
      
      toast({
        title: "Category Removed",
        description: `"${categoryName}" has been removed from your categories`,
      });
      
      return updated;
    });
  };

  return {
    customCategories,
    addCustomCategory,
    removeCustomCategory
  };
}
