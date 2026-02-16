
import React, { useState, useRef, useCallback, useMemo } from "react";
import { Header } from "@/components/Header";
import { MealPlanSection } from "@/components/MealPlanSection";
import { ShoppingListContainer } from "@/components/ShoppingList/ShoppingListContainer";
import { WeeklyMealPlansSection } from "@/components/WeeklyMealPlansSection";
import { Footer } from "@/components/Footer";
import { PrintButton } from "@/components/PrintButton";
import { MobileBottomNav, MobileSection } from "@/components/MobileBottomNav";
import { LoadingState } from "@/components/LoadingState";
import { ErrorState } from "@/components/ErrorState";
import { DashboardView } from "@/components/DashboardView";
import { useSupabaseMealPlan } from "@/hooks/useSupabaseMealPlan";
import { useShoppingList } from "@/hooks/useShoppingList";
import { useIsMobile } from "@/hooks/use-mobile";

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
    error,
    retry,
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

  // Memoized handlers
  const handleSaveWeeklyPlanMemo = useCallback((name: string) => {
    handleSaveWeeklyPlan(name, getCurrentItems, getAvailableStores);
  }, [handleSaveWeeklyPlan, getCurrentItems, getAvailableStores]);

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState error={error} onRetry={retry} />;
  }

  // Determine what to show based on mobile section
  const showDashboard = isMobile && mobileSection === "home";
  const showMealPlan = !isMobile || mobileSection === "meals";
  const showShopping = !isMobile || mobileSection === "shopping";
  const showWeeklyPlans = !isMobile || mobileSection === "meals";

  const mealsWithDays = meals.filter(m => m.day && m.day !== "").length;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Skip to main content for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md"
      >
        Skip to main content
      </a>

      <Header />
      
      <main id="main-content" className={`flex-1 ${isMobile ? "pb-20" : ""}`} role="main" aria-label="Meal planning content">
        <div className="container mx-auto px-4 py-2 sm:py-4 flex justify-end">
          <PrintButton 
            meals={meals} 
            groceryItems={groceryItems} 
            getCurrentItems={getCurrentItems}
          />
        </div>

        {/* Dashboard View - Mobile Home Tab Only */}
        {showDashboard && (
          <DashboardView
            mealsCount={mealsWithDays}
            groceryCount={groceryItems?.filter(i => !i.checked)?.length || 0}
            weeklyPlansCount={weeklyPlans?.length || 0}
            onNavigate={(section) => setMobileSection(section as MobileSection)}
          />
        )}
        
        {/* Meal Plan Section */}
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
              onSaveCurrentPlan={handleSaveWeeklyPlanMemo}
            />
          </div>
        )}
        
        {/* Shopping List */}
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
        
        {/* Weekly Plans */}
        {showWeeklyPlans && (
          <WeeklyMealPlansSection
            weeklyPlans={weeklyPlans}
            currentMeals={meals}
            onSaveCurrentPlan={handleSaveWeeklyPlanMemo}
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
