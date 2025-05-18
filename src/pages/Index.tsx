import React, { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { MealPlanSection } from "@/components/MealPlanSection";
import { ShoppingListSection } from "@/components/ShoppingListSection";
import { FamilyPreferencesSection } from "@/components/FamilyPreferencesSection";
import { PantrySection } from "@/components/PantrySection";
import { WeeklyMealPlansSection } from "@/components/WeeklyMealPlansSection";
import { Footer } from "@/components/Footer";
import { PrintButton } from "@/components/PrintButton";
import { useToast } from "@/hooks/use-toast";
import { 
  Meal, 
  FamilyPreference, 
  GroceryItem,
  WeeklyMealPlan
} from "@/types";
import { 
  generateSampleMealPlan, 
  samplePantryItems, 
  sampleFamilyPreferences,
  generateShoppingList,
  getCurrentWeekStart,
  extractIngredientsFromRecipeUrl
} from "@/utils/mealPlannerUtils";

const Index = () => {
  const { toast } = useToast();
  const [meals, setMeals] = useState<Meal[]>([]);
  const [pantryItems, setPantryItems] = useState<string[]>([]);
  const [familyPreferences, setFamilyPreferences] = useState<FamilyPreference[]>([]);
  const [groceryItems, setGroceryItems] = useState<GroceryItem[]>([]);
  const [weeklyPlans, setWeeklyPlans] = useState<WeeklyMealPlan[]>([]);
  const [availableStores, setAvailableStores] = useState<string[]>(["Any Store", "Supermarket", "Farmers Market", "Specialty Store"]);
  const [recurringItems, setRecurringItems] = useState<GroceryItem[]>([]);

  // Initialize with sample data
  useEffect(() => {
    // Try to load from localStorage first
    const savedMeals = localStorage.getItem('mealPlannerMeals');
    const savedPantryItems = localStorage.getItem('mealPlannerPantryItems');
    const savedFamilyPreferences = localStorage.getItem('mealPlannerFamilyPreferences');
    const savedWeeklyPlans = localStorage.getItem('mealPlannerWeeklyPlans');
    const savedRecurringItems = localStorage.getItem('mealPlannerRecurringItems');
    const savedStores = localStorage.getItem('mealPlannerStores');
    
    // Use saved data if it exists, otherwise use sample data
    const initialMeals = savedMeals ? JSON.parse(savedMeals) : generateSampleMealPlan();
    const initialPantryItems = savedPantryItems ? JSON.parse(savedPantryItems) : samplePantryItems;
    const initialFamilyPreferences = savedFamilyPreferences 
      ? JSON.parse(savedFamilyPreferences) 
      : sampleFamilyPreferences;
    const initialWeeklyPlans = savedWeeklyPlans ? JSON.parse(savedWeeklyPlans) : [];
    const initialRecurringItems = savedRecurringItems ? JSON.parse(savedRecurringItems) : [];
    const initialStores = savedStores ? JSON.parse(savedStores) : ["Any Store", "Supermarket", "Farmers Market", "Specialty Store"];
    
    setMeals(initialMeals);
    setPantryItems(initialPantryItems);
    setFamilyPreferences(initialFamilyPreferences);
    setWeeklyPlans(initialWeeklyPlans);
    setRecurringItems(initialRecurringItems);
    setAvailableStores(initialStores);
    
    // Generate initial shopping list
    const shoppingList = generateShoppingList(initialMeals, initialPantryItems, initialRecurringItems);
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
    if (weeklyPlans.length > 0) {
      localStorage.setItem('mealPlannerWeeklyPlans', JSON.stringify(weeklyPlans));
    }
    if (recurringItems.length > 0) {
      localStorage.setItem('mealPlannerRecurringItems', JSON.stringify(recurringItems));
    }
    if (availableStores.length > 0) {
      localStorage.setItem('mealPlannerStores', JSON.stringify(availableStores));
    }
  }, [meals, pantryItems, familyPreferences, weeklyPlans, recurringItems, availableStores]);

  // Update shopping list when meals or pantry changes
  useEffect(() => {
    if (meals.length > 0) {
      // Only include meals that have a day assigned
      const activeMeals = meals.filter(meal => meal.day && meal.day !== "");
      const shoppingList = generateShoppingList(activeMeals, pantryItems, recurringItems);
      setGroceryItems(shoppingList);
    }
  }, [meals, pantryItems, recurringItems]);

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

  const handleAddMealToDay = async (meal: Meal, day: string) => {
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
    
    // If the meal has a recipeUrl but no ingredients, try to fetch them
    let mealToAdd = { ...meal };
    if (meal.recipeUrl && (!meal.ingredients || meal.ingredients.length === 0)) {
      toast({
        title: "Fetching Ingredients",
        description: "Attempting to get ingredients from recipe URL...",
      });
      
      try {
        const ingredients = await extractIngredientsFromRecipeUrl(meal.recipeUrl);
        if (ingredients.length > 0) {
          mealToAdd.ingredients = ingredients;
          toast({
            title: "Ingredients Found",
            description: `Found ${ingredients.length} ingredients for ${meal.title}`,
          });
        } else {
          toast({
            title: "No Ingredients Found",
            description: "Couldn't extract ingredients from the URL. Please add them manually.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error fetching ingredients:", error);
        toast({
          title: "Error",
          description: "Failed to fetch ingredients. Please add them manually.",
          variant: "destructive",
        });
      }
    }
    
    // For adding a new meal to a day (allowing multiple meals per day)
    const existingMeal = meals.find(m => m.id === meal.id);
    
    if (existingMeal) {
      // Update existing meal
      setMeals(prevMeals =>
        prevMeals.map(m =>
          m.id === meal.id
            ? { ...mealToAdd, day, lastUsed: new Date() }
            : m
        )
      );
    } else {
      // Add a completely new meal
      setMeals(prevMeals => [
        ...prevMeals,
        {
          ...mealToAdd,
          id: meal.id || `${day}-${Date.now()}`, // Use existing ID or generate new one
          day, // Set the day
          lastUsed: new Date(),
        },
      ]);
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

  const handleToggleGroceryItem = (id: string) => {
    setGroceryItems(prevItems =>
      prevItems.map((item) =>
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    );
  };

  const handleUpdateGroceryItem = (updatedItem: GroceryItem) => {
    setGroceryItems(prevItems =>
      prevItems.map(item =>
        item.id === updatedItem.id ? updatedItem : item
      )
    );
    
    // If the item is marked as recurring, add/update it in the recurring items list
    if (updatedItem.recurring) {
      setRecurringItems(prevItems => {
        const existingItem = prevItems.find(item => item.id === updatedItem.id);
        if (existingItem) {
          return prevItems.map(item =>
            item.id === updatedItem.id ? updatedItem : item
          );
        } else {
          return [...prevItems, updatedItem];
        }
      });
    } else {
      // If the item is marked as not recurring, remove it from recurring items
      setRecurringItems(prevItems =>
        prevItems.filter(item => item.id !== updatedItem.id)
      );
    }
  };

  const handleUpdateStores = (stores: string[]) => {
    setAvailableStores(stores);
    toast({
      title: "Stores Updated",
      description: `Your store list has been updated`,
    });
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

  const handleSaveWeeklyPlan = (name: string) => {
    // Create a new weekly plan with the current meals
    const newPlan: WeeklyMealPlan = {
      id: Date.now().toString(),
      name,
      weekStartDate: getCurrentWeekStart(),
      meals: [...meals]
    };
    
    setWeeklyPlans([...weeklyPlans, newPlan]);
    
    toast({
      title: "Weekly Plan Saved",
      description: `"${name}" has been saved for future reference.`,
    });
  };

  const handleLoadWeeklyPlan = (plan: WeeklyMealPlan) => {
    // Replace current meals with the selected plan
    setMeals(plan.meals.map(meal => ({
      ...meal,
      lastUsed: new Date() // Update the last used date
    })));
    
    toast({
      title: "Weekly Plan Loaded",
      description: `"${plan.name}" has been loaded.`,
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
          onUpdateItem={handleUpdateGroceryItem}
          availableStores={availableStores}
          onUpdateStores={handleUpdateStores}
        />
        
        <WeeklyMealPlansSection
          weeklyPlans={weeklyPlans}
          currentMeals={meals}
          onSaveCurrentPlan={handleSaveWeeklyPlan}
          onLoadPlan={handleLoadWeeklyPlan}
        />
        
        <FamilyPreferencesSection 
          preferences={familyPreferences}
          onEditPreference={() => {}}
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
