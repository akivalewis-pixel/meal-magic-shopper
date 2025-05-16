
import React, { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Meal } from "@/types";
import { Star, StarHalf } from "lucide-react";

interface MealRatingDialogProps {
  meal: Meal;
  isOpen: boolean;
  onClose: () => void;
  onSaveRating: (meal: Meal, rating: number, notes: string) => void;
}

export const MealRatingDialog = ({ meal, isOpen, onClose, onSaveRating }: MealRatingDialogProps) => {
  const [rating, setRating] = useState<number>(meal.rating || 0);
  const [notes, setNotes] = useState<string>(meal.notes || "");
  
  const handleSave = () => {
    onSaveRating(meal, rating, notes);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Rate this meal</DialogTitle>
          <DialogDescription>
            How did everyone like {meal.title}?
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <div className="flex items-center justify-center space-x-2 mb-6">
            {[1, 2, 3, 4, 5].map((star) => (
              <Button
                key={star}
                variant="ghost"
                size="icon"
                className={`h-10 w-10 ${rating >= star ? 'text-yellow-400' : 'text-gray-300'}`}
                onClick={() => setRating(star)}
              >
                <Star className="h-6 w-6" />
                <span className="sr-only">{star} stars</span>
              </Button>
            ))}
          </div>
          
          <div className="space-y-2">
            <label htmlFor="meal-notes" className="text-sm font-medium">
              Notes
            </label>
            <Textarea
              id="meal-notes"
              placeholder="Add notes about this meal (e.g., 'Kids loved it', 'Too spicy', etc.)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Rating
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
