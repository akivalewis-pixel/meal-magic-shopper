import React, { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { MealPlanSection } from "@/components/MealPlanSection";
import { ShoppingListSection } from "@/components/ShoppingListSection";
import { FamilyPreferencesSection } from "@/components/FamilyPreferencesSection";
import { PantrySection } from "@/components/PantrySection";
import { Footer } from "@/components/Footer";
import { PrintButton } from "@/components/PrintButton";
import { useToast } from "@/hooks/use-toast";
import { 
  Meal, 
  FamilyPreference, 
  GroceryItem 
} from "@/types";
import { 
  generateSampleMealPlan, 
  samplePantryItems, 
  sampleFamilyPreferences,
  generateShoppingList
} from "@/utils/mealPlannerUtils";

const Index = () => {
  const { toast } = useToast();
  const [meals, setMeals] = useState<Meal[]>([]);
  const [pantryItems, setPantryItems] = useState<string[]>([]);
  const [familyPreferences, setFamilyPreferences] = useState<FamilyPreference[]>([]);
  const [groceryItems, setGroceryItems] = useState<GroceryItem[]>([]);

  // Initialize with sample data
  useEffect(() => {
    // Try to load from localStorage first
    const savedMeals = localStorage.getItem('mealPlannerMeals');
    const savedPantryItems = localStorage.getItem('mealPlannerPantryItems');
    const savedFamilyPreferences = localStorage.getItem('mealPlannerFamilyPreferences');
    
    // Use saved data if it exists, otherwise use sample data
    const initialMeals = savedMeals ? JSON.parse(savedMeals) : generateSampleMealPlan();
    const initialPantryItems = savedPantryItems ? JSON.parse(savedPantryItems) : samplePantryItems;
    const initialFamilyPreferences = savedFamilyPreferences 
      ? JSON.parse(savedFamilyPreferences) 
      : sampleFamilyPreferences;
    
    setMeals(initialMeals);
    setPantryItems(initialPantryItems);
    setFamilyPreferences(initialFamilyPreferences);
    
    // Generate initial shopping list
    const shoppingList = generateShoppingList(initialMeals, initialPantryItems);
    setGroceryItems(shoppingList);
  }, []);

  // Save to localStorage when state changes
  useEffect(() => {
    if (meals.length > 0) {
      localStorage.setItem('mealPlannerMeals', JSON.stringify(meals));
    }
    if (pantryItems.length > 0) {
      localStorage.setItem('mealPlannerPantryItems', JSON.stringify(pantryItems));
    }
    if (familyPreferences.length > 0) {
      localStorage.setItem('mealPlannerFamilyPreferences', JSON.stringify(familyPreferences));
    }
  }, [meals, pantryItems, familyPreferences]);

  // Update shopping list when meals or pantry changes
  useEffect(() => {
    if (meals.length > 0) {
      // Only include meals that have a day assigned
      const activeMeals = meals.filter(meal => meal.day && meal.day !== "");
      const shoppingList = generateShoppingList(activeMeals, pantryItems);
      setGroceryItems(shoppingList);
    }
  }, [meals, pantryItems]);

  const handleEditMeal = (meal: Meal) => {
    // This would open a meal editing modal in a full implementation
    toast({
      title: "Edit Meal",
      description: `You've selected to edit ${meal.title} for ${meal.day}`,
    });
  };

  const handleRateMeal = (meal: Meal, rating: number, notes: string) => {
    setMeals(prevMeals => 
      prevMeals.map(m => 
        m.id === meal.id 
          ? { ...m, rating, notes, lastUsed: new Date() }
          : m
      )
    );
    
    toast({
      title: "Meal Rated",
      description: `You've rated ${meal.title} ${rating}/5 stars`,
    });
  };

  const handleAddMealToDay = (meal: Meal, day: string) => {
    // If day is empty, remove the meal from the weekly plan but keep it in the collection
    if (!day) {
      setMeals(prevMeals =>
        prevMeals.map(m =>
          m.id === meal.id
            ? { ...m, day: "" }
            : m
        )
      );
      
      toast({
        title: "Meal Removed",
        description: `${meal.title} has been removed from the meal plan`,
      });
      return;
    }
    
    // Check if the day already has a meal
    const dayHasMeal = meals.some(m => m.day === day);
    
    if (dayHasMeal) {
      // Replace the meal for that day
      setMeals(prevMeals =>
        prevMeals.map(m =>
          m.day === day
            ? {
                ...meal,
                id: `${day}-${Date.now()}`, // Generate a new ID if needed
                day, // Set the day
                lastUsed: new Date(),
              }
            : m
        )
      );
    } else {
      // Add a new meal for that day if it doesn't already exist
      const existingMeal = meals.find(m => m.id === meal.id);
      
      if (existingMeal) {
        // Update existing meal
        setMeals(prevMeals =>
          prevMeals.map(m =>
            m.id === meal.id
              ? { ...m, day, lastUsed: new Date() }
              : m
          )
        );
      } else {
        // Add a completely new meal
        setMeals(prevMeals => [
          ...prevMeals,
          {
            ...meal,
            id: meal.id || `${day}-${Date.now()}`, // Use existing ID or generate new one
            day, // Set the day
            lastUsed: new Date(),
          },
        ]);
      }
    }
    
    toast({
      title: "Meal Added",
      description: `${meal.title} has been added to ${day}`,
    });
  };

  const handleAddFamilyMember = (preference: FamilyPreference) => {
    setFamilyPreferences(prevPreferences => [...prevPreferences, preference]);
    
    toast({
      title: "Family Member Added",
      description: `Preferences for ${preference.familyMember} have been added`,
    });
  };

  const handleRemoveFamilyMember = (id: string) => {
    const memberToRemove = familyPreferences.find(p => p.id === id);
    
    if (memberToRemove) {
      setFamilyPreferences(prevPreferences => 
        prevPreferences.filter(p => p.id !== id)
      );
      
      toast({
        title: "Family Member Removed",
        description: `${memberToRemove.familyMember} has been removed`,
      });
    }
  };

  const handleUpdateFamilyPreference = (updatedPreference: FamilyPreference) => {
    setFamilyPreferences(prevPreferences =>
      prevPreferences.map(p =>
        p.id === updatedPreference.id ? updatedPreference : p
      )
    );
  };

  const handleEditFamilyPreference = (preference: FamilyPreference) => {
    // This event is handled inside the FamilyPreferencesSection
    // Just leaving this here for backward compatibility
  };

  const handleToggleGroceryItem = (id: string) => {
    setGroceryItems(
      groceryItems.map((item) =>
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    );
  };

  const handleAddPantryItem = (item: string) => {
    if (!pantryItems.includes(item)) {
      setPantryItems([...pantryItems, item]);
      toast({
        title: "Pantry Updated",
        description: `Added ${item} to your pantry`,
      });
    } else {
      toast({
        title: "Item already exists",
        description: `${item} is already in your pantry`,
        variant: "destructive",
      });
    }
  };

  const handleRemovePantryItem = (item: string) => {
    setPantryItems(pantryItems.filter((i) => i !== item));
    toast({
      title: "Pantry Updated",
      description: `Removed ${item} from your pantry`,
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        <div className="container mx-auto px-4 py-4 flex justify-end">
          <PrintButton meals={meals} groceryItems={groceryItems} />
        </div>
        
        <MealPlanSection 
          meals={meals} 
          onEditMeal={handleEditMeal} 
          onRateMeal={handleRateMeal}
          onAddMealToDay={handleAddMealToDay}
        />
        
        <ShoppingListSection 
          groceryItems={groceryItems} 
          onToggleItem={handleToggleGroceryItem} 
        />
        
        <FamilyPreferencesSection 
          preferences={familyPreferences}
          onEditPreference={handleEditFamilyPreference}
          onAddPreference={handleAddFamilyMember}
          onRemovePreference={handleRemoveFamilyMember}
          onUpdatePreference={handleUpdateFamilyPreference}
        />
        
        <PantrySection 
          pantryItems={pantryItems}
          onAddItem={handleAddPantryItem}
          onRemoveItem={handleRemovePantryItem}
        />
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
