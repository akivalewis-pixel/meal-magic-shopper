import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

export function useCustomCategories() {
  const { toast } = useToast();
  const [customCategories, setCustomCategories] = useState<string[]>([]);
  const [defaultCategoryOverrides, setDefaultCategoryOverrides] = useState<Record<string, string>>({});

  useEffect(() => {
    // Load custom categories from localStorage
    const savedCategories = localStorage.getItem('mealPlannerCustomCategories');
    console.log("useCustomCategories: Loading custom categories from localStorage:", savedCategories);
    if (savedCategories) {
      const parsed = JSON.parse(savedCategories);
      console.log("useCustomCategories: Parsed custom categories:", parsed);
      setCustomCategories(parsed);
    }

    // Load default category overrides from localStorage
    const savedOverrides = localStorage.getItem('mealPlannerDefaultCategoryOverrides');
    console.log("useCustomCategories: Loading default overrides from localStorage:", savedOverrides);
    if (savedOverrides) {
      const parsed = JSON.parse(savedOverrides);
      console.log("useCustomCategories: Parsed default overrides:", parsed);
      setDefaultCategoryOverrides(parsed);
    }

    // MIGRATION: Check for old useCategoryNames data and migrate it
    const oldCategoryNames = localStorage.getItem('mealPlannerCustomCategoryNames');
    if (oldCategoryNames) {
      try {
        const parsed = JSON.parse(oldCategoryNames);
        console.log("useCustomCategories: Migrating old category names:", parsed);
        setDefaultCategoryOverrides(prev => ({ ...prev, ...parsed }));
        // Clean up the old data
        localStorage.removeItem('mealPlannerCustomCategoryNames');
      } catch (error) {
        console.error("useCustomCategories: Error migrating old category names:", error);
      }
    }
  }, []);

  // Save custom categories when they change
  useEffect(() => {
    console.log("useCustomCategories: Saving custom categories to localStorage:", customCategories);
    localStorage.setItem('mealPlannerCustomCategories', JSON.stringify(customCategories));
  }, [customCategories]);

  // Save default category overrides when they change
  useEffect(() => {
    console.log("useCustomCategories: Saving default overrides to localStorage:", defaultCategoryOverrides);
    localStorage.setItem('mealPlannerDefaultCategoryOverrides', JSON.stringify(defaultCategoryOverrides));
  }, [defaultCategoryOverrides]);

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

  const addDefaultCategoryOverride = (originalName: string, newName: string) => {
    const trimmedName = newName.trim();
    if (!trimmedName) return;

    console.log("useCustomCategories: Adding default category override:", originalName, "->", trimmedName);
    
    setDefaultCategoryOverrides(prev => {
      const updated = { ...prev, [originalName]: trimmedName };
      console.log("useCustomCategories: New default overrides state:", updated);
      
      toast({
        title: "Category Renamed",
        description: `"${originalName}" renamed to "${trimmedName}"`,
      });
      
      return updated;
    });
  };

  const removeDefaultCategoryOverride = (originalName: string) => {
    setDefaultCategoryOverrides(prev => {
      const updated = { ...prev };
      delete updated[originalName];
      console.log("useCustomCategories: Removed default override:", originalName, "New state:", updated);
      
      toast({
        title: "Category Name Reset",
        description: `"${originalName}" name has been reset to default`,
      });
      
      return updated;
    });
  };

  const getAllCategories = () => {
    const baseDefaults = ["produce", "dairy", "meat", "grains", "frozen", "pantry", "spices", "other"];
    return [...baseDefaults, ...customCategories];
  };

  const getCategoryDisplayName = (category: string) => {
    // First check if it's a default category with an override
    if (defaultCategoryOverrides[category]) {
      return defaultCategoryOverrides[category];
    }
    // Otherwise return capitalized version
    return category.charAt(0).toUpperCase() + category.slice(1);
  };

  return {
    customCategories,
    defaultCategoryOverrides,
    addCustomCategory,
    removeCustomCategory,
    addDefaultCategoryOverride,
    removeDefaultCategoryOverride,
    getAllCategories,
    getCategoryDisplayName
  };
}
