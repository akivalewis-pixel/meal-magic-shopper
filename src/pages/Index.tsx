
import React from "react";
import { Header } from "@/components/Header";
import { MealPlanSection } from "@/components/MealPlanSection";
import { ShoppingListContainer } from "@/components/ShoppingList/ShoppingListContainer";
import { WeeklyMealPlansSection } from "@/components/WeeklyMealPlansSection";
import { Footer } from "@/components/Footer";
import { PrintButton } from "@/components/PrintButton";
import { useSupabaseMealPlan } from "@/hooks/useSupabaseMealPlan";
import { useShoppingList } from "@/hooks/useShoppingList";
import { useIsMobile } from "@/hooks/use-mobile";
import { Loader2 } from "lucide-react";

const Index = () => {
  const isMobile = useIsMobile();
  
  // Meal plan state and actions with Supabase
  const {
    meals,
    weeklyPlans,
    loading,
    handleEditMeal,
    handleUpdateMeal,
    handleRateMeal,
    handleAddMealToDay,
    handleSaveWeeklyPlan,
    handleLoadWeeklyPlan,
    handleDeleteWeeklyPlan,
    handleResetMealPlan
  } = useSupabaseMealPlan();

  // Shopping list state and actions (still using localStorage for now)
  const shoppingList = useShoppingList(meals, []);
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
  } = shoppingList;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  console.log("Index.tsx: Shopping list has", groceryItems.length, "items");

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        <div className="container mx-auto px-4 py-2 sm:py-4 flex justify-end">
          <PrintButton 
            meals={meals} 
            groceryItems={groceryItems} 
            getCurrentItems={getCurrentItems}
          />
        </div>
        
        <MealPlanSection 
          meals={meals} 
          onEditMeal={handleEditMeal}
          onUpdateMeal={handleUpdateMeal}
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
          onDeletePlan={handleDeleteWeeklyPlan}
        />
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
