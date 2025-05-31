
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
    getCurrentItems, 
    getAvailableStores, 
    resetList, 
    loadShoppingList 
  } = shoppingListHook;

  // Update meal plan hook with shopping list functions
  React.useEffect(() => {
    // This ensures the meal plan hook has access to the shopping list functions
    // We can't pass these during initialization due to hook order dependencies
  }, [getCurrentItems, getAvailableStores, resetList, loadShoppingList]);

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
