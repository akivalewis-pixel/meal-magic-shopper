
import React from "react";
import { Header } from "@/components/Header";
import { MealPlanSection } from "@/components/MealPlan";
import { ShoppingListSection } from "@/components/ShoppingList";
import { FamilyPreferencesSection } from "@/components/FamilyPreferencesSection";
import { PantrySection } from "@/components/PantrySection";
import { WeeklyMealPlansSection } from "@/components/WeeklyMealPlansSection";
import { Footer } from "@/components/Footer";
import { PrintButton } from "@/components/PrintButton";
import { useMealPlan } from "@/hooks/useMealPlan";
import { useShoppingList } from "@/hooks/useShoppingList";
import { usePantry } from "@/hooks/usePantry";
import { useFamilyPreferences } from "@/hooks/useFamilyPreferences";

const Index = () => {
  // Custom hooks for state management
  const { 
    pantryItems,
    handleAddPantryItem,
    handleRemovePantryItem
  } = usePantry();
  
  const {
    familyPreferences,
    handleAddFamilyMember,
    handleRemoveFamilyMember,
    handleUpdateFamilyPreference
  } = useFamilyPreferences();
  
  const {
    meals,
    weeklyPlans,
    handleEditMeal,
    handleRateMeal,
    handleAddMealToDay,
    handleSaveWeeklyPlan,
    handleLoadWeeklyPlan,
    handleResetMealPlan
  } = useMealPlan();
  
  const {
    groceryItems,
    availableStores,
    handleToggleGroceryItem,
    handleUpdateGroceryItem,
    handleUpdateStores,
    handleAddGroceryItem,
    handleArchiveItem,
    resetShoppingList
  } = useShoppingList(meals, pantryItems);

  // Handle resetting both meal plan and shopping list
  const handleResetAll = () => {
    handleResetMealPlan();
    resetShoppingList();
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
          onResetMealPlan={handleResetAll}
        />
        
        <ShoppingListSection 
          groceryItems={groceryItems} 
          onToggleItem={handleToggleGroceryItem}
          onUpdateItem={handleUpdateGroceryItem}
          availableStores={availableStores}
          onUpdateStores={handleUpdateStores}
          onAddItem={handleAddGroceryItem}
          onArchiveItem={handleArchiveItem}
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
