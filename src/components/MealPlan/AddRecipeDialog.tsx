
import React, { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { dietaryOptions } from "@/utils/mealPlannerUtils";
import { DietaryPreference } from "@/types";
import { useToast } from "@/hooks/use-toast";

interface AddRecipeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAddRecipe: (recipeData: any) => void;
  selectedDay: string;
  onFetchIngredients: (url: string) => Promise<string[]>;
}

export const AddRecipeDialog = ({
  isOpen,
  onClose,
  onAddRecipe,
  selectedDay,
  onFetchIngredients
}: AddRecipeDialogProps) => {
  const [isFetchingIngredients, setIsFetchingIngredients] = useState(false);
  const { toast } = useToast();
  
  const form = useForm({
    defaultValues: {
      title: "",
      recipeUrl: "",
      ingredients: "",
      dietaryPreferences: ["none"]
    }
  });

  // Reset form when dialog opens/closes
  React.useEffect(() => {
    if (isOpen) {
      form.reset({
        title: "",
        recipeUrl: "",
        ingredients: "",
        dietaryPreferences: ["none"]
      });
    }
  }, [isOpen, form]);

  // Function to handle recipe URL change and auto-fetch ingredients
  const handleRecipeUrlChange = async (url: string) => {
    if (!url || url.trim() === "") return;
    
    try {
      setIsFetchingIngredients(true);
      const ingredients = await onFetchIngredients(url);
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

  const onSubmit = (data: any) => {
    onAddRecipe({
      ...data,
      day: selectedDay,
      ingredients: data.ingredients.split(',').map((item: string) => item.trim())
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Recipe for {selectedDay}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                          // Don't auto-fetch on every keystroke
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
            
            <DialogFooter className="gap-2 pt-2">
              <Button variant="outline" type="button" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">
                Add Recipe
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
