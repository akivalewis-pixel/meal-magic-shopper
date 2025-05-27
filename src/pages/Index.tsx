
import React from "react";
import { Header } from "@/components/Header";
import { MealPlanSection } from "@/components/MealPlan";
import { NewShoppingList } from "@/components/ShoppingList/NewShoppingList";
import { WeeklyMealPlansSection } from "@/components/WeeklyMealPlansSection";
import { Footer } from "@/components/Footer";
import { PrintButton } from "@/components/PrintButton";
import { useMealPlan } from "@/hooks/useMealPlan";
import { useSimpleShoppingList } from "@/hooks/useShoppingList/useSimpleShoppingList";

const Index = () => {
  // Custom hooks for state management
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

  // Get the shopping list items for printing
  const { groceryItems, getCurrentItems } = useSimpleShoppingList(meals, []);

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
        
        <NewShoppingList 
          meals={meals}
          pantryItems={[]}
        />
        
        <WeeklyMealPlansSection
          weeklyPlans={weeklyPlans}
          currentMeals={meals}
          onSaveCurrentPlan={handleSaveWeeklyPlan}
          onLoadPlan={handleLoadWeeklyPlan}
        />
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
