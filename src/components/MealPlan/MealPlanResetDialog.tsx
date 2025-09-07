
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface MealPlanResetDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onResetWithoutSaving: () => void;
  onSaveAndReset: (planName: string) => void;
  hasMeals: boolean;
}

export const MealPlanResetDialog = ({
  isOpen,
  onClose,
  onResetWithoutSaving,
  onSaveAndReset,
  hasMeals
}: MealPlanResetDialogProps) => {
  const [showSaveForm, setShowSaveForm] = useState(false);
  const [planName, setPlanName] = useState("");

  const handleSaveAndReset = () => {
    if (planName.trim()) {
      onSaveAndReset(planName.trim());
      setPlanName("");
      setShowSaveForm(false);
      onClose();
    }
  };

  const handleResetWithoutSaving = () => {
    onResetWithoutSaving();
    onClose();
  };

  const handleClose = () => {
    setShowSaveForm(false);
    setPlanName("");
    onClose();
  };

  if (!showSaveForm) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-[500px] w-[95vw]">
          <DialogHeader>
            <DialogTitle>Reset Meal Plan</DialogTitle>
            <DialogDescription>
              {hasMeals 
                ? "You have meals planned for this week. Would you like to save your current meal plan before resetting?"
                : "Are you sure you want to reset the meal plan? This action cannot be undone."
              }
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col gap-3 sm:flex-row sm:gap-2 pt-4">
            <Button variant="outline" onClick={handleClose} className="order-1 sm:order-1">
              Cancel
            </Button>
            {hasMeals && (
              <Button 
                variant="outline" 
                onClick={() => setShowSaveForm(true)}
                className="order-2 sm:order-2 bg-blue-50 hover:bg-blue-100 border-blue-300"
              >
                Save & Reset
              </Button>
            )}
            <Button 
              variant="destructive" 
              onClick={handleResetWithoutSaving}
              className="order-3 sm:order-3 whitespace-nowrap"
            >
              {hasMeals ? "Reset Without Saving" : "Reset"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Save Current Meal Plan</DialogTitle>
          <DialogDescription>
            Give your meal plan a name to save it before resetting.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="plan-name" className="text-right">
              Plan Name
            </Label>
            <Input
              id="plan-name"
              value={planName}
              onChange={(e) => setPlanName(e.target.value)}
              placeholder="e.g., Family Favorites"
              className="col-span-3"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && planName.trim()) {
                  handleSaveAndReset();
                }
              }}
            />
          </div>
        </div>
        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={() => setShowSaveForm(false)}>
            Back
          </Button>
          <Button 
            onClick={handleSaveAndReset} 
            disabled={!planName.trim()}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Save & Reset
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
