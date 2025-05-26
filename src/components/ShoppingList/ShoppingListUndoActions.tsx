
import React from "react";
import { Button } from "@/components/ui/button";
import { Undo2, Redo2 } from "lucide-react";

interface ShoppingListUndoActionsProps {
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
}

export const ShoppingListUndoActions = ({
  canUndo,
  canRedo,
  onUndo,
  onRedo
}: ShoppingListUndoActionsProps) => {
  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={onUndo}
        disabled={!canUndo}
        className="flex items-center gap-1"
      >
        <Undo2 className="h-4 w-4" />
        Undo
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        onClick={onRedo}
        disabled={!canRedo}
        className="flex items-center gap-1"
      >
        <Redo2 className="h-4 w-4" />
        Redo
      </Button>
    </div>
  );
};
