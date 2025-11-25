import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useToast } from "@/hooks/use-toast";

interface CustomCategoriesContextType {
  customCategories: string[];
  defaultCategoryOverrides: Record<string, string>;
  addCustomCategory: (categoryName: string) => void;
  removeCustomCategory: (categoryName: string) => void;
  addDefaultCategoryOverride: (originalName: string, newName: string) => void;
  removeDefaultCategoryOverride: (originalName: string) => void;
  getAllCategories: () => string[];
  getCategoryDisplayName: (category: string) => string;
}

const CustomCategoriesContext = createContext<CustomCategoriesContextType | undefined>(undefined);

export function CustomCategoriesProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [customCategories, setCustomCategories] = useState<string[]>([]);
  const [defaultCategoryOverrides, setDefaultCategoryOverrides] = useState<Record<string, string>>({});
  const [isInitialized, setIsInitialized] = useState(false);

  // Load initial data from localStorage once on mount
  useEffect(() => {
    const savedCategories = localStorage.getItem('mealPlannerCustomCategories');
    const savedOverrides = localStorage.getItem('mealPlannerDefaultCategoryOverrides');
    
    if (savedCategories) {
      try {
        setCustomCategories(JSON.parse(savedCategories));
      } catch (error) {
        console.error("Error loading custom categories:", error);
      }
    }
    
    if (savedOverrides) {
      try {
        setDefaultCategoryOverrides(JSON.parse(savedOverrides));
      } catch (error) {
        console.error("Error loading category overrides:", error);
      }
    }

    // Migration: Check for old useCategoryNames data
    const oldCategoryNames = localStorage.getItem('mealPlannerCustomCategoryNames');
    if (oldCategoryNames) {
      try {
        const parsed = JSON.parse(oldCategoryNames);
        setDefaultCategoryOverrides(prev => ({ ...prev, ...parsed }));
        localStorage.removeItem('mealPlannerCustomCategoryNames');
      } catch (error) {
        console.error("Error migrating old category names:", error);
      }
    }

    setIsInitialized(true);
  }, []);

  // Save custom categories to localStorage (only after initialization)
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem('mealPlannerCustomCategories', JSON.stringify(customCategories));
    }
  }, [customCategories, isInitialized]);

  // Save default category overrides to localStorage (only after initialization)
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem('mealPlannerDefaultCategoryOverrides', JSON.stringify(defaultCategoryOverrides));
    }
  }, [defaultCategoryOverrides, isInitialized]);

  const addCustomCategory = (categoryName: string) => {
    const trimmedName = categoryName.trim();
    if (!trimmedName) return;

    setCustomCategories(prev => {
      const exists = prev.some(cat => cat.toLowerCase() === trimmedName.toLowerCase());
      if (exists) {
        toast({
          title: "Category Already Exists",
          description: `"${trimmedName}" is already in your categories`,
        });
        return prev;
      }
      
      toast({
        title: "Category Added",
        description: `"${trimmedName}" has been added to your categories`,
      });
      
      return [...prev, trimmedName];
    });
  };

  const removeCustomCategory = (categoryName: string) => {
    setCustomCategories(prev => {
      const updated = prev.filter(cat => cat !== categoryName);
      
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

    setDefaultCategoryOverrides(prev => {
      const updated = { ...prev, [originalName]: trimmedName };
      
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
    if (defaultCategoryOverrides[category]) {
      return defaultCategoryOverrides[category];
    }
    return category.charAt(0).toUpperCase() + category.slice(1);
  };

  return (
    <CustomCategoriesContext.Provider
      value={{
        customCategories,
        defaultCategoryOverrides,
        addCustomCategory,
        removeCustomCategory,
        addDefaultCategoryOverride,
        removeDefaultCategoryOverride,
        getAllCategories,
        getCategoryDisplayName,
      }}
    >
      {children}
    </CustomCategoriesContext.Provider>
  );
}

export function useCustomCategories() {
  const context = useContext(CustomCategoriesContext);
  if (context === undefined) {
    throw new Error("useCustomCategories must be used within a CustomCategoriesProvider");
  }
  return context;
}
