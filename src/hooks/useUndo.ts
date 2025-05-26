
import { useState, useCallback } from 'react';

export interface UndoAction {
  id: string;
  type: 'toggle' | 'archive' | 'update' | 'add' | 'delete';
  data: any;
  timestamp: number;
}

export function useUndo() {
  const [undoStack, setUndoStack] = useState<UndoAction[]>([]);
  const [redoStack, setRedoStack] = useState<UndoAction[]>([]);

  const addAction = useCallback((action: Omit<UndoAction, 'timestamp'>) => {
    const timestampedAction: UndoAction = {
      ...action,
      timestamp: Date.now()
    };
    
    setUndoStack(prev => [...prev, timestampedAction]);
    setRedoStack([]); // Clear redo stack when new action is added
    
    console.log('Undo: Action added:', timestampedAction);
  }, []);

  const undo = useCallback(() => {
    if (undoStack.length === 0) return null;
    
    const lastAction = undoStack[undoStack.length - 1];
    setUndoStack(prev => prev.slice(0, -1));
    setRedoStack(prev => [...prev, lastAction]);
    
    console.log('Undo: Reversing action:', lastAction);
    return lastAction;
  }, [undoStack]);

  const redo = useCallback(() => {
    if (redoStack.length === 0) return null;
    
    const lastUndoAction = redoStack[redoStack.length - 1];
    setRedoStack(prev => prev.slice(0, -1));
    setUndoStack(prev => [...prev, lastUndoAction]);
    
    console.log('Undo: Redoing action:', lastUndoAction);
    return lastUndoAction;
  }, [redoStack]);

  const canUndo = undoStack.length > 0;
  const canRedo = redoStack.length > 0;

  return {
    addAction,
    undo,
    redo,
    canUndo,
    canRedo,
    lastAction: undoStack[undoStack.length - 1] || null
  };
}
