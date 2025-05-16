
import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import { Meal, DietaryPreference } from "@/types";

interface MealCardProps {
  meal: Meal;
  onEdit: (meal: Meal) => void;
}

export const MealCard = ({ meal, onEdit }: MealCardProps) => {
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
        {meal.notes && (
          <div className="mt-2 text-sm">
            <h4 className="font-medium">Notes:</h4>
            <p className="text-muted-foreground">{meal.notes}</p>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between pt-2">
        <Button variant="ghost" size="sm" onClick={() => onEdit(meal)}>
          Edit
        </Button>
        {meal.recipeUrl && (
          <Button variant="outline" size="sm" className="gap-1" asChild>
            <a href={meal.recipeUrl} target="_blank" rel="noopener noreferrer">
              Recipe <ExternalLink className="h-3 w-3" />
            </a>
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};
