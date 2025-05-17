
import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Star, StarHalf, Trash, Edit, Heart } from "lucide-react";
import { Meal, DietaryPreference } from "@/types";

interface MealCardProps {
  meal: Meal;
  onEdit: (meal: Meal) => void;
  onRate: (meal: Meal) => void;
  onRemove?: (meal: Meal) => void;
}

export const MealCard = ({ meal, onEdit, onRate, onRemove }: MealCardProps) => {
  const dietLabels: Record<DietaryPreference, string> = {
    'vegetarian': 'bg-leaf text-white',
    'vegan': 'bg-leaf-dark text-white',
    'kosher': 'bg-blue-500 text-white',
    'halal': 'bg-green-600 text-white',
    'gluten-free': 'bg-yellow-500 text-black',
    'dairy-free': 'bg-blue-400 text-white',
    'nut-free': 'bg-orange-400 text-white',
    'none': 'bg-gray-200 text-gray-800',
  };

  return (
    <Card className="meal-card h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{meal.title}</CardTitle>
        <CardDescription className="flex flex-wrap gap-1 pt-1">
          {meal.dietaryPreferences.map((pref) => (
            <Badge key={pref} className={dietLabels[pref]}>
              {pref === 'none' ? 'Regular' : pref}
            </Badge>
          ))}
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="text-sm">
          <h4 className="font-medium">Ingredients:</h4>
          <ul className="list-disc pl-5 text-muted-foreground">
            {meal.ingredients.slice(0, 3).map((ingredient, i) => (
              <li key={i}>{ingredient}</li>
            ))}
            {meal.ingredients.length > 3 && <li>+ {meal.ingredients.length - 3} more</li>}
          </ul>
        </div>
        
        {meal.rating && (
          <div className="mt-2 flex items-center">
            <div className="flex text-yellow-400">
              {[...Array(Math.floor(meal.rating))].map((_, i) => (
                <Star key={i} className="h-4 w-4" />
              ))}
              {meal.rating % 1 >= 0.5 && <StarHalf className="h-4 w-4" />}
            </div>
          </div>
        )}
        
        {meal.notes && (
          <div className="mt-2 text-sm">
            <h4 className="font-medium">Notes:</h4>
            <p className="text-muted-foreground">{meal.notes}</p>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-wrap justify-between gap-1 pt-2">
        <div className="flex flex-wrap gap-1">
          <Button variant="ghost" size="sm" className="h-8 px-2 text-xs" onClick={() => onEdit(meal)}>
            <Edit className="h-3 w-3 mr-1" />
            Edit
          </Button>
          <Button variant="ghost" size="sm" className="h-8 px-2 text-xs" onClick={() => onRate(meal)}>
            <Star className="h-3 w-3 mr-1" />
            Rate
          </Button>
        </div>
        <div className="flex gap-1">
          {meal.recipeUrl && (
            <Button variant="outline" size="sm" className="h-8 px-2 text-xs" asChild>
              <a href={meal.recipeUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-3 w-3 mr-1" />
                Recipe
              </a>
            </Button>
          )}
          {onRemove && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0" 
              onClick={(e) => {
                e.stopPropagation();
                onRemove(meal);
              }}
            >
              <Trash className="h-3 w-3 text-red-500" />
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};
