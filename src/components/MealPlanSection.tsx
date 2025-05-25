
import React, { useState } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { MealCard } from "./MealCard";
import { MealRatingDialog } from "./MealRatingDialog";
import { MealRecommendations } from "./MealRecommendations";
import { Meal, DietaryPreference } from "@/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { X, Plus, Loader2 } from "lucide-react";
import { Form, FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { daysOfWeek, dietaryOptions } from "@/utils/constants";
import { filterMealsByDiet } from "@/utils/mealUtils";
import { useToast } from "@/hooks/use-toast";

// Function to extract ingredients from a recipe URL
const fetchIngredientsFromUrl = async (url: string): Promise<string[]> => {
  // In a real implementation, this would use a recipe API or scraping service
  // For now, we'll simulate a fetch with some placeholder data
  return new Promise((resolve) => {
    setTimeout(() => {
      // Simulate some common ingredients based on the URL
      if (url.includes("pasta") || url.includes("spaghetti")) {
        resolve(["pasta", "tomatoes", "garlic", "onion", "olive oil", "basil"]);
      } else if (url.includes("chicken")) {
        resolve(["chicken breast", "salt", "pepper", "olive oil", "garlic powder", "herbs"]);
      } else if (url.includes("salad")) {
        resolve(["lettuce", "cucumber", "tomatoes", "bell pepper", "olive oil", "vinegar"]);
      } else if (url.includes("soup")) {
        resolve(["broth", "onion", "carrots", "celery", "salt", "pepper", "herbs"]);
      } else {
        resolve(["ingredients could not be automatically detected"]);
      }
    }, 1000);
  });
};

interface MealPlanSectionProps {
  meals: Meal[];
  onEditMeal: (meal: Meal) => void;
  onUpdateMeal: (updatedMeal: Meal) => void;
  onRateMeal: (meal: Meal, rating: number, notes: string) => void;
  onAddMealToDay: (meal: Meal, day: string) => void;
  onResetMealPlan: () => void;
}

// Drag item type
const ItemTypes = {
  MEAL: 'meal'
};

// Draggable meal component
const DraggableMeal = ({ meal, day, onEdit, onRate, onMove, onRemove }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.MEAL,
    item: { id: meal.id, day: day, meal: meal },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging()
    })
  }));

  return (
    <div 
      ref={drag} 
      className={`${isDragging ? 'opacity-50' : 'opacity-100'} mb-2 last:mb-0`}
    >
      <MealCard 
        meal={meal} 
        onEdit={onEdit} 
        onRate={onRate}
        onRemove={onRemove}
      />
    </div>
  );
};

// Droppable day component
const DroppableDay = ({ day, meals, onDrop, onEdit, onRate, onMove, onAddMeal, onRemove }) => {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: ItemTypes.MEAL,
    drop: (item: { id: string, day: string, meal: Meal }) => {
      onMove(item.meal, item.day, day);
      return { name: day };
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver()
    })
  }));

  return (
    <div 
      ref={drop} 
      className={`flex flex-col ${isOver ? 'bg-gray-100' : ''} h-full`}
    >
      <h3 className="mb-2 text-center font-semibold">{day}</h3>
      <div className="flex-1 flex flex-col">
        {meals && meals.length > 0 ? (
          meals.map(meal => (
            <DraggableMeal 
              key={meal.id}
              meal={meal} 
              day={day} 
              onEdit={onEdit} 
              onRate={onRate}
              onMove={onMove}
              onRemove={() => onRemove(meal)}
            />
          ))
        ) : (
          <div 
            className="meal-card flex h-full flex-col items-center justify-center p-4 text-center text-muted-foreground cursor-pointer"
            onClick={() => onAddMeal(day)}
          >
            <p className="mb-2">No meals planned</p>
            <p className="text-sm">
              Click to add a meal
            </p>
          </div>
        )}
      </div>
      <div className="mt-2 flex justify-center">
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full"
          onClick={() => onAddMeal(day)}
        >
          <Plus className="h-4 w-4 mr-1" /> Add Meal
        </Button>
      </div>
    </div>
  );
};

export const MealPlanSection = ({ 
  meals, 
  onEditMeal, 
  onUpdateMeal,
  onRateMeal,
  onAddMealToDay,
  onResetMealPlan
}: MealPlanSectionProps) => {
  const { toast } = useToast();
  const [dietFilter, setDietFilter] = useState<DietaryPreference>("none");
  const [mealToRate, setMealToRate] = useState<Meal | null>(null);
  const [showAddRecipe, setShowAddRecipe] = useState(false);
  const [selectedDay, setSelectedDay] = useState("");
  const [isFetchingIngredients, setIsFetchingIngredients] = useState(false);
  
  const filteredMeals = dietFilter === "none" 
    ? meals 
    : filterMealsByDiet(meals, dietFilter);

  // Get meals for a specific day
  const getMealsForDay = (day: string) => {
    return filteredMeals.filter(meal => meal.day === day);
  };

  const handleOpenRatingDialog = (meal: Meal) => {
    setMealToRate(meal);
  };

  const handleCloseRatingDialog = () => {
    setMealToRate(null);
  };

  const handleSaveRating = (meal: Meal, rating: number, notes: string) => {
    onRateMeal(meal, rating, notes);
    setMealToRate(null);
  };

  const handleSelectRecommendation = (meal: Meal) => {
    // Find the first day without a meal
    const dayWithoutMeal = daysOfWeek.find(day => !meals.some(m => m.day === day));
    if (dayWithoutMeal) {
      onAddMealToDay(meal, dayWithoutMeal);
    } else {
      // If all days have meals, suggest adding to Sunday
      onAddMealToDay(meal, 'Sunday');
    }
  };

  const handleMoveMeal = (meal: Meal, fromDay: string, toDay: string) => {
    // Create a copy of the meal with the new day
    const updatedMeal = { ...meal, day: toDay };
    
    // Add to the new day without removing anything from the original day
    onAddMealToDay(updatedMeal, toDay);
  };

  const handleRemoveMeal = (meal: Meal) => {
    // Create a copy of the meal with empty day to remove it
    const updatedMeal = { ...meal, day: "" };
    onAddMealToDay(updatedMeal, "");
  };

  const handleAddNewRecipe = (day: string) => {
    setSelectedDay(day);
    setShowAddRecipe(true);
  };

  const form = useForm({
    defaultValues: {
      title: "",
      recipeUrl: "",
      ingredients: "",
      dietaryPreferences: ["none"]
    }
  });

  // Function to handle recipe URL change and auto-fetch ingredients
  const handleRecipeUrlChange = async (url: string) => {
    if (!url || url.trim() === "") return;
    
    try {
      setIsFetchingIngredients(true);
      const ingredients = await fetchIngredientsFromUrl(url);
      form.setValue('ingredients', ingredients.join(', '));
      
      toast({
        title: "Ingredients detected",
        description: "Recipe ingredients have been automatically added.",
      });
    } catch (error) {
      toast({
        title: "Error fetching ingredients",
        description: "Could not automatically detect ingredients.",
        variant: "destructive"
      });
    } finally {
      setIsFetchingIngredients(false);
    }
  };

  const onSubmitNewRecipe = (data) => {
    const newMeal: Meal = {
      id: `${selectedDay}-${Date.now()}`,
      day: selectedDay,
      title: data.title,
      recipeUrl: data.recipeUrl,
      ingredients: data.ingredients.split(',').map(item => item.trim()),
      dietaryPreferences: Array.isArray(data.dietaryPreferences) 
        ? data.dietaryPreferences 
        : [data.dietaryPreferences] as DietaryPreference[],
      lastUsed: new Date()
    };
    
    onAddMealToDay(newMeal, selectedDay);
    setShowAddRecipe(false);
    form.reset();
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <section id="meal-plan" className="py-8">
        <div className="container mx-auto">
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-2xl font-bold text-leaf-dark">Weekly Meal Plan</h2>
            <div className="mt-4 sm:mt-0">
              <div className="flex items-center gap-2">
                <Label htmlFor="diet-filter" className="whitespace-nowrap">
                  Dietary Filter:
                </Label>
                <Select
                  value={dietFilter}
                  onValueChange={(value) => setDietFilter(value as DietaryPreference)}
                >
                  <SelectTrigger id="diet-filter" className="w-[180px]">
                    <SelectValue placeholder="Select diet" />
                  </SelectTrigger>
                  <SelectContent>
                    {dietaryOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="mb-6 flex justify-end">
            <Button onClick={() => {
              setSelectedDay(daysOfWeek.find(day => !getMealsForDay(day).length) || 'Sunday');
              setShowAddRecipe(true);
            }}>
              <Plus className="mr-1 h-4 w-4" /> Add Recipe
            </Button>
          </div>

          <MealRecommendations 
            meals={meals}
            onSelectMeal={handleSelectRecommendation}
          />

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-7">
            {daysOfWeek.map((day) => (
              <DroppableDay 
                key={day} 
                day={day} 
                meals={getMealsForDay(day)}
                onDrop={handleMoveMeal}
                onEdit={onEditMeal}
                onRate={handleOpenRatingDialog}
                onMove={handleMoveMeal}
                onAddMeal={handleAddNewRecipe}
                onRemove={handleRemoveMeal}
              />
            ))}
          </div>
          
          {mealToRate && (
            <MealRatingDialog 
              meal={mealToRate}
              isOpen={true}
              onClose={handleCloseRatingDialog}
              onSaveRating={handleSaveRating}
            />
          )}

          {/* Add Recipe Dialog */}
          <Dialog open={showAddRecipe} onOpenChange={setShowAddRecipe}>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Add Recipe for {selectedDay}</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmitNewRecipe)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Recipe Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter recipe name" {...field} required />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="recipeUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Recipe URL (optional)</FormLabel>
                        <FormControl>
                          <div className="flex gap-2">
                            <Input 
                              placeholder="https://cooking.nytimes.com/..." 
                              type="url"
                              {...field} 
                              onChange={(e) => {
                                field.onChange(e);
                                // Don't auto-fetch on every keystroke, only when the field loses focus
                              }}
                              onBlur={(e) => {
                                field.onBlur();
                                if (e.target.value) {
                                  handleRecipeUrlChange(e.target.value);
                                }
                              }}
                            />
                            <Button 
                              type="button" 
                              variant="outline" 
                              onClick={() => handleRecipeUrlChange(field.value)}
                              disabled={isFetchingIngredients || !field.value}
                            >
                              {isFetchingIngredients ? (
                                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                              ) : (
                                "Fetch"
                              )}
                            </Button>
                          </div>
                        </FormControl>
                        {isFetchingIngredients && <p className="text-xs text-muted-foreground mt-1">Fetching ingredients...</p>}
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="ingredients"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ingredients (comma separated)</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="onions, garlic, tomatoes..." 
                            {...field} 
                            required
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="dietaryPreferences"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Dietary Preferences</FormLabel>
                        <Select
                          value={field.value[0] || "none"}
                          onValueChange={(value) => field.onChange([value])}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select diet" />
                          </SelectTrigger>
                          <SelectContent>
                            {dietaryOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex justify-end gap-2 pt-2">
                    <Button variant="outline" type="button" onClick={() => setShowAddRecipe(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">
                      Add Recipe
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </section>
    </DndProvider>
  );
};
