
import React, { useState } from "react";
import { 
  WeeklyMealPlan, 
  Meal 
} from "@/types";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MealCard } from "./MealCard";
import { 
  formatWeekRange, 
  formatWeekStartDate 
} from "@/utils/dateUtils";
import { 
  searchMealsByTitle, 
  countMealUsage 
} from "@/utils/mealUtils";
import { findLastUsedDate } from "@/utils/dateUtils";
import { Search, Calendar } from "lucide-react";

interface WeeklyMealPlansSectionProps {
  weeklyPlans: WeeklyMealPlan[];
  currentMeals: Meal[];
  onSaveCurrentPlan: (name: string) => void;
  onLoadPlan: (plan: WeeklyMealPlan) => void;
}

export const WeeklyMealPlansSection = ({
  weeklyPlans,
  currentMeals,
  onSaveCurrentPlan,
  onLoadPlan,
}: WeeklyMealPlansSectionProps) => {
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [planName, setPlanName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchType, setSearchType] = useState<"week" | "meal">("week");
  const [selectedPlan, setSelectedPlan] = useState<WeeklyMealPlan | null>(null);
  const [mealSearchResults, setMealSearchResults] = useState<Meal[]>([]);
  const [selectedMeal, setSelectedMeal] = useState<string | null>(null);

  const handleSearch = () => {
    if (searchType === "meal" && searchTerm) {
      const results = searchMealsByTitle(weeklyPlans, searchTerm);
      setMealSearchResults(results);
    }
  };

  const filteredPlans = searchType === "week" && searchTerm
    ? weeklyPlans.filter(plan => 
        plan.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        formatWeekStartDate(plan.weekStartDate).toLowerCase().includes(searchTerm.toLowerCase())
      )
    : weeklyPlans;

  const handleSavePlan = () => {
    onSaveCurrentPlan(planName);
    setSaveDialogOpen(false);
    setPlanName("");
  };

  const handlePlanClick = (plan: WeeklyMealPlan) => {
    setSelectedPlan(plan);
  };

  const handleMealClick = (mealTitle: string) => {
    setSelectedMeal(mealTitle === selectedMeal ? null : mealTitle);
  };

  const handleLoadPlan = () => {
    if (selectedPlan) {
      onLoadPlan(selectedPlan);
      setSelectedPlan(null);
    }
  };

  return (
    <section id="weekly-meal-plans" className="py-8 bg-gray-100">
      <div className="container mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-carrot-dark">Weekly Meal Plans</h2>
          <Button onClick={() => setSaveDialogOpen(true)} className="mt-2 sm:mt-0">
            Save Current Plan
          </Button>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <Label htmlFor="search-plans">Search Plans</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search-plans"
                  placeholder="Search plans or meals..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="flex items-end">
                <Button
                  variant={searchType === "week" ? "default" : "outline"}
                  onClick={() => setSearchType("week")}
                  className="flex-1 sm:flex-none"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Search by Week
                </Button>
              </div>
              <div className="flex items-end">
                <Button
                  variant={searchType === "meal" ? "default" : "outline"}
                  onClick={() => {
                    setSearchType("meal");
                    setMealSearchResults([]);
                  }}
                  className="flex-1 sm:flex-none"
                >
                  Search by Meal
                </Button>
              </div>
              <div className="flex items-end">
                <Button onClick={handleSearch} className="flex-1 sm:flex-none">
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </Button>
              </div>
            </div>
          </div>

          {searchType === "week" ? (
            <div className="space-y-4">
              <h3 className="text-lg font-medium mb-4">Saved Weekly Plans</h3>
              {filteredPlans.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {filteredPlans.map((plan) => (
                    <div
                      key={plan.id}
                      className={`border rounded-lg p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                        selectedPlan?.id === plan.id ? "bg-blue-50 border-blue-300" : ""
                      }`}
                      onClick={() => handlePlanClick(plan)}
                    >
                      <h4 className="font-medium">{plan.name}</h4>
                      <p className="text-sm text-gray-600">{formatWeekRange(plan.weekStartDate)}</p>
                      <p className="text-sm mt-2">
                        {plan.meals.filter(m => m.day).length} meals planned
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-8">
                  {searchTerm ? "No plans match your search." : "No saved meal plans yet."}
                </p>
              )}

              {selectedPlan && (
                <div className="mt-8 pt-6 border-t">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h3 className="text-lg font-medium">{selectedPlan.name}</h3>
                      <p className="text-sm text-gray-600">
                        {formatWeekRange(selectedPlan.weekStartDate)}
                      </p>
                    </div>
                    <Button onClick={handleLoadPlan}>
                      Load This Plan
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {selectedPlan.meals
                      .filter(meal => meal.day)
                      .map((meal) => (
                        <div key={meal.id} className="bg-gray-50 p-3 rounded-lg">
                          <p className="font-medium">{meal.day}</p>
                          <p>{meal.title}</p>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <h3 className="text-lg font-medium mb-4">Search Meals</h3>
              {searchTerm && (
                <p className="text-sm mb-4">
                  Enter a meal name and click "Search" to find when it was used.
                </p>
              )}

              {mealSearchResults.length > 0 ? (
                <div>
                  <h4 className="font-medium mb-2">Search Results for "{searchTerm}"</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Array.from(new Set(mealSearchResults.map(m => m.title))).map((mealTitle) => {
                      const count = countMealUsage(weeklyPlans, mealTitle);
                      const lastUsed = findLastUsedDate(weeklyPlans, mealTitle);
                      const isSelected = selectedMeal === mealTitle;
                      
                      return (
                        <div 
                          key={mealTitle}
                          className={`border rounded-lg p-4 cursor-pointer hover:bg-gray-50 ${isSelected ? "bg-blue-50 border-blue-300" : ""}`}
                          onClick={() => handleMealClick(mealTitle)}
                        >
                          <h5 className="font-medium">{mealTitle}</h5>
                          <p className="text-sm text-gray-600">Used {count} times</p>
                          {lastUsed && (
                            <p className="text-sm text-gray-600">
                              Last used: {new Date(lastUsed).toLocaleDateString()}
                            </p>
                          )}
                          
                          {isSelected && (
                            <div className="mt-3 pt-3 border-t">
                              <h6 className="font-medium mb-2">Meal History</h6>
                              <ul className="text-sm">
                                {weeklyPlans
                                  .filter(plan => plan.meals.some(m => m.title === mealTitle))
                                  .sort((a, b) => new Date(b.weekStartDate).getTime() - new Date(a.weekStartDate).getTime())
                                  .map(plan => (
                                    <li key={plan.id} className="mb-1">
                                      {formatWeekRange(plan.weekStartDate)} - {plan.name}
                                    </li>
                                  ))
                                }
                              </ul>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : searchTerm ? (
                <p className="text-center text-gray-500 py-8">
                  No meals found matching "{searchTerm}".
                </p>
              ) : (
                <p className="text-center text-gray-500 py-8">
                  Enter a meal name and click "Search" to find when it was used.
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Save Plan Dialog */}
      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Save Weekly Meal Plan</DialogTitle>
            <DialogDescription>
              Give your meal plan a name to save it for future reference.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="plan-name" className="text-right">
                Plan Name
              </Label>
              <Input
                id="plan-name"
                value={planName}
                onChange={(e) => setPlanName(e.target.value)}
                placeholder="e.g., Family Favorites"
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSaveDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSavePlan} disabled={!planName.trim()}>
              Save Plan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
};
