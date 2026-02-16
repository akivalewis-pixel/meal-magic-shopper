
import React, { useState, useCallback } from "react";
import { Meal } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Star, Edit, ExternalLink, Trash } from "lucide-react";
import { cn } from "@/lib/utils";
import { ShareButton, generateRecipeContent } from "@/components/Share";
import { useIsMobile } from "@/hooks/use-mobile";

const truncateTitle = (title: string, wordCount: number) => {
  const words = title.trim().split(/\s+/);
  if (words.length <= wordCount) return title;
  return words.slice(0, wordCount).join(" ") + "…";
};

interface MealCardProps {
  meal: Meal;
  onEdit?: (meal: Meal) => void;
  onRate?: (meal: Meal) => void;
  onRemove?: () => void;
  onUpdateMeal?: (updatedMeal: Meal) => void;
  className?: string;
}

export const MealCard = ({ meal, onEdit, onRate, onRemove, onUpdateMeal, className }: MealCardProps) => {
  const isMobile = useIsMobile();
  const [localTitle, setLocalTitle] = useState(meal.title);
  const [isEditingTitle, setIsEditingTitle] = useState(false);

  // Update local title when meal title changes externally
  React.useEffect(() => {
    setLocalTitle(meal.title);
  }, [meal.title]);

  const handleTitleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalTitle(e.target.value);
  }, []);

  const handleTitleCommit = useCallback(() => {
    if (localTitle !== meal.title && onUpdateMeal) {
      const updatedMeal = { 
        ...meal, 
        title: localTitle
      };
      onUpdateMeal(updatedMeal);
    }
    setIsEditingTitle(false);
  }, [meal, localTitle, onUpdateMeal]);

  const handleTitleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleTitleCommit();
    } else if (e.key === 'Escape') {
      setLocalTitle(meal.title);
      setIsEditingTitle(false);
    }
  }, [handleTitleCommit, meal.title]);

  const handleTitleClick = useCallback(() => {
    if (onUpdateMeal) {
      setIsEditingTitle(true);
    }
  }, [onUpdateMeal]);

  return (
    <Card className={cn("w-full overflow-hidden", className)}>
      <CardContent className="p-3">
        {isEditingTitle ? (
          <Input
            value={localTitle}
            onChange={handleTitleInputChange}
            onBlur={handleTitleCommit}
            onKeyDown={handleTitleKeyDown}
            className="border-border p-1 h-8 font-medium text-sm mb-1"
            placeholder="Meal name"
            autoFocus
          />
        ) : (
          <h4 
            className={`font-medium text-sm mb-1 line-clamp-1 ${onUpdateMeal ? 'cursor-pointer hover:bg-muted rounded px-1 py-0.5' : ''}`}
            onClick={handleTitleClick}
            title={meal.title}
          >
            {isMobile ? truncateTitle(meal.title, 2) : meal.title}
          </h4>
        )}
        {meal.recipeUrl && (
          <a
            href={meal.recipeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-primary line-clamp-1 flex items-center group min-h-[44px] py-2 touch-manipulation"
            onClick={(e) => {
              // Ensure external links always open in a new window/tab
              e.stopPropagation();
              window.open(meal.recipeUrl, '_blank', 'noopener,noreferrer');
              e.preventDefault();
            }}
          >
            <ExternalLink className="h-4 w-4 mr-1.5 inline flex-shrink-0" />
            <span className="group-hover:underline">Open Recipe</span>
            <ExternalLink className="h-3 w-3 ml-1 inline opacity-50 flex-shrink-0" />
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

          <ShareButton
            title={meal.title}
            content={generateRecipeContent(meal)}
            type="recipe"
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
          >
            <span className="sr-only">Share</span>
          </ShareButton>
        </div>
        
        {onRemove && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-7 w-7 p-0 text-destructive hover:text-destructive hover:bg-destructive/10" 
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
