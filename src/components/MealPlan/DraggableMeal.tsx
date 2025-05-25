
import React from "react";
import { useDrag } from "react-dnd";
import { MealCard } from "../MealCard";
import { Meal } from "@/types";

// Drag item type
const ItemTypes = {
  MEAL: 'meal'
};

interface DraggableMealProps {
  meal: Meal;
  day: string;
  onEdit: (meal: Meal) => void;
  onRate: (meal: Meal) => void;
  onMove: (meal: Meal, fromDay: string, toDay: string) => void;
  onRemove: () => void;
  onUpdateMeal?: (updatedMeal: Meal) => void;
}

export const DraggableMeal = ({ 
  meal, 
  day, 
  onEdit, 
  onRate, 
  onMove, 
  onRemove,
  onUpdateMeal
}: DraggableMealProps) => {
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
        onUpdateMeal={onUpdateMeal}
      />
    </div>
  );
};
