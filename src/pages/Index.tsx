
import React from "react";
import { Header } from "@/components/Header";
import { MealPlanSection } from "@/components/MealPlan";
import { ShoppingListContainer } from "@/components/ShoppingList/ShoppingListContainer";
import { WeeklyMealPlansSection } from "@/components/WeeklyMealPlansSection";
import { Footer } from "@/components/Footer";
import { PrintButton } from "@/components/PrintButton";
import { useMealPlan } from "@/hooks/useMealPlan";
import { useSimpleShoppingList } from "@/hooks/useShoppingList/useSimpleShoppingList";

const Index = () => {
  // Custom hooks for state management with shopping list integration
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

  // Single shopping list hook that will be shared between components
  const shoppingListHook = useSimpleShoppingList(meals, []);
  const { 
    groceryItems, 
    archivedItems,
    availableStores,
    updateItem,
    toggleItem,
    archiveItem,
    addItem,
    updateStores,
    resetList,
    getCurrentItems, 
    getAvailableStores, 
    loadShoppingList 
  } = shoppingListHook;

  console.log("Index.tsx: Shopping list has", groceryItems.length, "items");

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        <div className="container mx-auto px-4 py-4 flex justify-end">
          <PrintButton 
            meals={meals} 
            groceryItems={groceryItems} 
            getCurrentItems={getCurrentItems}
          />
        </div>
        
        <MealPlanSection 
          meals={meals} 
          onEditMeal={handleEditMeal}
          onRateMeal={handleRateMeal}
          onAddMealToDay={handleAddMealToDay}
          onResetMealPlan={handleResetMealPlan}
        />
        
        <ShoppingListContainer 
          meals={meals}
          pantryItems={[]}
          groceryItems={groceryItems}
          archivedItems={archivedItems}
          availableStores={availableStores}
          updateItem={updateItem}
          toggleItem={toggleItem}
          archiveItem={archiveItem}
          addItem={addItem}
          updateStores={updateStores}
          resetList={resetList}
          getCurrentItems={getCurrentItems}
        />
        
        <WeeklyMealPlansSection
          weeklyPlans={weeklyPlans}
          currentMeals={meals}
          onSaveCurrentPlan={(name) => handleSaveWeeklyPlan(name, getCurrentItems, getAvailableStores)}
          onLoadPlan={(plan) => handleLoadWeeklyPlan(plan, resetList, loadShoppingList)}
        />
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
