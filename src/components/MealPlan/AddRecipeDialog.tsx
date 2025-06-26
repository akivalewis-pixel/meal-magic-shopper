
import React, { useState, useEffect } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { Meal } from "@/types";
import { useToast } from "@/hooks/use-toast";

interface AddRecipeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAddRecipe: (recipeData: any) => void;
  selectedDay: string;
  onFetchIngredients: (url: string) => Promise<{
    title?: string;
    ingredients: string[];
    quantities?: Record<string, string>;
  }>;
  editingMeal?: Meal | null;
}

export const AddRecipeDialog = ({
  isOpen,
  onClose,
  onAddRecipe,
  selectedDay,
  onFetchIngredients,
  editingMeal
}: AddRecipeDialogProps) => {
  const [isFetchingIngredients, setIsFetchingIngredients] = useState(false);
  const { toast } = useToast();
  
  const form = useForm({
    defaultValues: {
      title: "",
      recipeUrl: "",
      ingredients: ""
    }
  });

  // Reset form when dialog opens/closes or when editing meal changes
  useEffect(() => {
    if (isOpen) {
      if (editingMeal) {
        // Pre-populate form with existing meal data
        form.reset({
          title: editingMeal.title || "",
          recipeUrl: editingMeal.recipeUrl || "",
          ingredients: editingMeal.ingredients ? editingMeal.ingredients.join(', ') : ""
        });
      } else {
        // Reset to empty form for new meal
        form.reset({
          title: "",
          recipeUrl: "",
          ingredients: ""
        });
      }
    }
  }, [isOpen, editingMeal, form]);

  // Function to handle recipe URL change and auto-fetch ingredients
  const handleRecipeUrlChange = async (url: string) => {
    if (!url || url.trim() === "") return;
    
    try {
      setIsFetchingIngredients(true);
      const recipeData = await onFetchIngredients(url);
      
      // If a title was extracted and we're not editing an existing meal, set it
      if (recipeData.title && !editingMeal) {
        form.setValue('title', recipeData.title);
      }
      
      // Format ingredients with quantities if available
      if (recipeData.ingredients.length > 0) {
        if (recipeData.quantities) {
          const formattedIngredients = recipeData.ingredients.map(ing => {
            const quantity = recipeData.quantities?.[ing] || "";
            return quantity ? `${quantity} ${ing}` : ing;
          });
          form.setValue('ingredients', formattedIngredients.join(', '));
        } else {
          form.setValue('ingredients', recipeData.ingredients.join(', '));
        }
        
        toast({
          title: "Recipe details extracted",
          description: "Ingredients have been automatically added.",
        });
      } else {
        toast({
          title: "No ingredients found",
          description: "Couldn't extract ingredients from the URL. Please add them manually.",
          variant: "destructive"
        });
      }
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

  const onSubmit = (data: any) => {
    onAddRecipe({
      ...data,
      day: selectedDay,
      ingredients: data.ingredients ? data.ingredients.split(',').map((item: string) => item.trim()).filter((item: string) => item.length > 0) : [],
      dietaryPreferences: ["none"] // Default to "none" since we're removing the field
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {editingMeal ? `Edit Recipe for ${selectedDay}` : `Add Recipe for ${selectedDay}`}
          </DialogTitle>
          <DialogDescription>
            {editingMeal 
              ? "Update the recipe details below."
              : "Enter a recipe URL to automatically extract ingredients, or add them manually. Ingredients are optional."
            }
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* URL field - placed at the top for emphasis */}
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
                  {isFetchingIngredients && <p className="text-xs text-muted-foreground mt-1">Fetching recipe data...</p>}
                </FormItem>
              )}
            />
            
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
              name="ingredients"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ingredients (optional, comma separated)</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="1 lb onions, 2 cloves garlic, 3 tomatoes..." 
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <DialogFooter className="gap-2 pt-2">
              <Button variant="outline" type="button" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">
                {editingMeal ? "Update Recipe" : "Add Recipe"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
