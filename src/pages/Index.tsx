
import React, { useState, useRef } from "react";
import { Header } from "@/components/Header";
import { MealPlanSection } from "@/components/MealPlanSection";
import { ShoppingListContainer } from "@/components/ShoppingList/ShoppingListContainer";
import { WeeklyMealPlansSection } from "@/components/WeeklyMealPlansSection";
import { Footer } from "@/components/Footer";
import { PrintButton } from "@/components/PrintButton";
import { MobileBottomNav, MobileSection } from "@/components/MobileBottomNav";
import { useSupabaseMealPlan } from "@/hooks/useSupabaseMealPlan";
import { useShoppingList } from "@/hooks/useShoppingList";
import { useIsMobile } from "@/hooks/use-mobile";
import { Loader2 } from "lucide-react";

const Index = () => {
  const isMobile = useIsMobile();
  const [mobileSection, setMobileSection] = useState<MobileSection>("home");
  
  // Section refs for scroll-to on desktop
  const shoppingRef = useRef<HTMLDivElement>(null);
  const mealsRef = useRef<HTMLDivElement>(null);
  
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

  // Shopping list state and actions
  const shoppingList = useShoppingList(meals, []);
  const { 
    groceryItems, 
    archivedItems,
    availableStores,
    updateItem,
    toggleItem,
    archiveItem,
    deleteItem,
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

  // Mobile: show only the active section
  const showMealPlan = !isMobile || mobileSection === "home" || mobileSection === "meals";
  const showShopping = !isMobile || mobileSection === "shopping";
  const showWeeklyPlans = !isMobile || mobileSection === "meals";

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className={`flex-1 ${isMobile ? "pb-20" : ""}`}>
        <div className="container mx-auto px-4 py-2 sm:py-4 flex justify-end">
          <PrintButton 
            meals={meals} 
            groceryItems={groceryItems} 
            getCurrentItems={getCurrentItems}
          />
        </div>
        
        {/* Meal Plan Section — shown on Home & Meals tabs */}
        {showMealPlan && (
          <div ref={mealsRef}>
            <MealPlanSection 
              meals={meals} 
              weeklyPlans={weeklyPlans}
              onEditMeal={handleEditMeal}
              onUpdateMeal={handleUpdateMeal}
              onRateMeal={handleRateMeal}
              onAddMealToDay={handleAddMealToDay}
              onResetMealPlan={handleResetMealPlan}
              onSaveCurrentPlan={(name) => handleSaveWeeklyPlan(name, getCurrentItems, getAvailableStores)}
            />
          </div>
        )}
        
        {/* Shopping List — shown on Home & Shopping tabs */}
        {showShopping && (
          <div ref={shoppingRef}>
            <ShoppingListContainer 
              meals={meals}
              pantryItems={[]}
              groceryItems={groceryItems}
              archivedItems={archivedItems}
              availableStores={availableStores}
              updateItem={updateItem}
              toggleItem={toggleItem}
              archiveItem={archiveItem}
              deleteItem={deleteItem}
              addItem={addItem}
              updateStores={updateStores}
              resetList={resetList}
              getCurrentItems={getCurrentItems}
            />
          </div>
        )}
        
        {/* Weekly Plans — shown on Home & Meals tabs */}
        {showWeeklyPlans && (
          <WeeklyMealPlansSection
            weeklyPlans={weeklyPlans}
            currentMeals={meals}
            onSaveCurrentPlan={(name) => handleSaveWeeklyPlan(name, getCurrentItems, getAvailableStores)}
            onLoadPlan={handleLoadWeeklyPlan}
            onDeletePlan={handleDeleteWeeklyPlan}
          />
        )}
      </main>
      
      {!isMobile && <Footer />}
      
      {isMobile && (
        <MobileBottomNav 
          activeSection={mobileSection} 
          onSectionChange={setMobileSection} 
        />
      )}
    </div>
  );
};

export default Index;
