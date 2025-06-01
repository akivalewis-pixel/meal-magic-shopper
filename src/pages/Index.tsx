
import React from "react";
import { Header } from "@/components/Header";
import { MealPlanSection } from "@/components/MealPlan";
import { ShoppingListContainer } from "@/components/ShoppingList/ShoppingListContainer";
import { WeeklyMealPlansSection } from "@/components/WeeklyMealPlansSection";
import { Footer } from "@/components/Footer";
import { PrintButton } from "@/components/PrintButton";
import { useMealPlan } from "@/hooks/useMealPlan";
import { useShoppingList } from "@/hooks/useShoppingList";

const Index = () => {
  // Meal plan state and actions
  const {
    meals,
    weeklyPlans,
    handleEditMeal,
    handleUpdateMeal,
    handleRateMeal,
    handleAddMealToDay,
    handleSaveWeeklyPlan,
    handleLoadWeeklyPlan,
    handleDeleteWeeklyPlan,
    handleResetMealPlan
  } = useMealPlan();

  // Shopping list state and actions
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
