
import React from "react";
import { useDrop } from "react-dnd";
import { Button } from "@/components/ui/button";
import { DraggableMeal } from "./DraggableMeal";
import { Meal } from "@/types";
import { Plus } from "lucide-react";

// Drag item type
const ItemTypes = {
  MEAL: 'meal'
};

interface DroppableDayProps {
  day: string;
  meals: Meal[];
  onDrop: (meal: Meal, fromDay: string, toDay: string) => void;
  onEdit: (meal: Meal) => void;
  onRate: (meal: Meal) => void;
  onMove: (meal: Meal, fromDay: string, toDay: string) => void;
  onAddMeal: (day: string) => void;
  onRemove: (meal: Meal) => void;
  onUpdateMeal?: (updatedMeal: Meal) => void;
}

export const DroppableDay = ({
  day,
  meals,
  onDrop,
  onEdit,
  onRate,
  onMove,
  onAddMeal,
  onRemove,
  onUpdateMeal
}: DroppableDayProps) => {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: ItemTypes.MEAL,
    drop: (item: { id: string, day: string, meal: Meal }) => {
      if (item.day !== day) {
        // Only move if the day changed
        onDrop(item.meal, item.day, day);
      }
      return { name: day };
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver()
    })
  }));

  return (
    <div 
      ref={drop} 
      className={`flex flex-col ${isOver ? 'bg-gray-100' : ''} h-full rounded-lg p-2 transition-colors`}
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
              onUpdateMeal={onUpdateMeal}
            />
          ))
        ) : (
          <div 
            className="meal-card flex h-full min-h-24 flex-col items-center justify-center p-4 text-center text-muted-foreground cursor-pointer bg-gray-50 rounded-lg"
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
