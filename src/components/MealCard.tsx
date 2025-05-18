
import React from "react";
import { Meal } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Star, Edit, ExternalLink, Trash } from "lucide-react";
import { cn } from "@/lib/utils";

interface MealCardProps {
  meal: Meal;
  onEdit?: (meal: Meal) => void;
  onRate?: (meal: Meal) => void;
  onRemove?: () => void;
  className?: string;
}

export const MealCard = ({ meal, onEdit, onRate, onRemove, className }: MealCardProps) => {
  return (
    <Card className={cn("w-full overflow-hidden", className)}>
      <CardContent className="p-3">
        <h4 className="font-medium text-sm mb-1 line-clamp-2">{meal.title}</h4>
        {meal.recipeUrl && (
          <a
            href={meal.recipeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-600 line-clamp-1 flex items-center group"
          >
            <ExternalLink className="h-3 w-3 mr-1 inline" />
            <span className="group-hover:underline">Recipe</span>
          </a>
        )}
      </CardContent>
      <CardFooter className="p-2 pt-0 flex justify-between">
        <div className="flex space-x-1">
          {onEdit && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-7 w-7 p-0" 
              onClick={() => onEdit(meal)}
            >
              <Edit className="h-3 w-3" />
              <span className="sr-only">Edit</span>
            </Button>
          )}
          
          {onRate && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-7 w-7 p-0" 
              onClick={() => onRate(meal)}
            >
              <Star className="h-3 w-3" fill={meal.rating ? "#FFD700" : "none"} />
              <span className="sr-only">Rate</span>
            </Button>
          )}
        </div>
        
        {onRemove && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-7 w-7 p-0 text-red-500 hover:text-red-700 hover:bg-red-50" 
            onClick={onRemove}
          >
            <Trash className="h-3 w-3" />
            <span className="sr-only">Remove</span>
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};
