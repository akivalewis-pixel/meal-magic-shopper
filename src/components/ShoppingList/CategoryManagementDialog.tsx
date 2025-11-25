
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Edit2, Check, X } from "lucide-react";
import { useCustomCategories } from "@/contexts/CustomCategoriesContext";
import { GroceryCategory } from "@/types";

interface CategoryManagementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CategoryManagementDialog = ({
  open,
  onOpenChange
}: CategoryManagementDialogProps) => {
  const { 
    customCategories, 
    addCustomCategory, 
    removeCustomCategory,
    defaultCategoryOverrides,
    addDefaultCategoryOverride,
    removeDefaultCategoryOverride
  } = useCustomCategories();
  
  const [newCategoryName, setNewCategoryName] = useState("");
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  // Base default categories from types
  const baseDefaultCategories: GroceryCategory[] = [
    "produce", "dairy", "meat", "grains", "frozen", "pantry", "spices", "other"
  ];

  const handleAddCategory = () => {
    if (newCategoryName.trim()) {
      addCustomCategory(newCategoryName.trim());
      setNewCategoryName("");
    }
  };

  const handleStartEdit = (category: string, isDefault: boolean) => {
    setEditingCategory(category);
    setEditValue(isDefault ? (defaultCategoryOverrides[category] || category) : category);
  };

  const handleSaveEdit = (originalCategory: string, isDefault: boolean) => {
    if (editValue.trim() && editValue !== originalCategory) {
      if (isDefault) {
        // For default categories, save as override
        addDefaultCategoryOverride(originalCategory, editValue.trim());
      } else {
        // For custom categories, remove old and add new
        removeCustomCategory(originalCategory);
        addCustomCategory(editValue.trim());
      }
    }
    setEditingCategory(null);
    setEditValue("");
  };

  const handleDeleteCategory = (category: string, isDefault: boolean) => {
    if (isDefault) {
      // For default categories, we can't truly delete them but we can hide them
      // This would require additional logic to track hidden categories
      // For now, we'll just show a message that default categories can't be deleted
      return;
    } else {
      removeCustomCategory(category);
    }
  };

  const handleCancelEdit = () => {
    setEditingCategory(null);
    setEditValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent, action: 'add' | 'edit', originalCategory?: string, isDefault?: boolean) => {
    if (e.key === 'Enter') {
      if (action === 'add') {
        handleAddCategory();
      } else if (originalCategory !== undefined && isDefault !== undefined) {
        handleSaveEdit(originalCategory, isDefault);
      }
    } else if (e.key === 'Escape' && action === 'edit') {
      handleCancelEdit();
    }
  };

  const getDisplayName = (category: string, isDefault: boolean) => {
    if (isDefault && defaultCategoryOverrides[category]) {
      return defaultCategoryOverrides[category];
    }
    return category.charAt(0).toUpperCase() + category.slice(1);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Manage Categories</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Add new category */}
          <div className="space-y-2">
            <Label htmlFor="new-category">Add New Category</Label>
            <div className="flex gap-2">
              <Input
                id="new-category"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, 'add')}
                placeholder="Enter category name"
                className="flex-1"
              />
              <Button
                onClick={handleAddCategory}
                disabled={!newCategoryName.trim()}
                size="sm"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Default categories */}
          <div className="space-y-2">
            <Label>Default Categories</Label>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {baseDefaultCategories.map((category) => (
                <div
                  key={category}
                  className="flex items-center justify-between p-2 bg-gray-50 rounded"
                >
                  {editingCategory === category ? (
                    <div className="flex items-center gap-2 flex-1">
                      <Input
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onKeyDown={(e) => handleKeyDown(e, 'edit', category, true)}
                        className="h-8 text-sm flex-1"
                        autoFocus
                      />
                      <Button
                        onClick={() => handleSaveEdit(category, true)}
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 text-green-600"
                      >
                        <Check className="h-3 w-3" />
                      </Button>
                      <Button
                        onClick={handleCancelEdit}
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 text-gray-500"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <>
                      <span className="text-sm text-gray-600">
                        {getDisplayName(category, true)}
                        {defaultCategoryOverrides[category] && (
                          <span className="text-xs text-blue-600 ml-1">(renamed)</span>
                        )}
                      </span>
                      <div className="flex items-center gap-1">
                        <Button
                          onClick={() => handleStartEdit(category, true)}
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 text-blue-600"
                        >
                          <Edit2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Custom categories */}
          {customCategories.length > 0 && (
            <div className="space-y-2">
              <Label>Custom Categories</Label>
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {customCategories.map((category) => (
                  <div
                    key={category}
                    className="flex items-center justify-between p-2 border rounded"
                  >
                    {editingCategory === category ? (
                      <div className="flex items-center gap-2 flex-1">
                        <Input
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onKeyDown={(e) => handleKeyDown(e, 'edit', category, false)}
                          className="h-8 text-sm flex-1"
                          autoFocus
                        />
                        <Button
                          onClick={() => handleSaveEdit(category, false)}
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 text-green-600"
                        >
                          <Check className="h-3 w-3" />
                        </Button>
                        <Button
                          onClick={handleCancelEdit}
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 text-gray-500"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ) : (
                      <>
                        <span className="text-sm">
                          {category.charAt(0).toUpperCase() + category.slice(1)}
                        </span>
                        <div className="flex items-center gap-1">
                          <Button
                            onClick={() => handleStartEdit(category, false)}
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 text-blue-600"
                          >
                            <Edit2 className="h-3 w-3" />
                          </Button>
                          <Button
                            onClick={() => handleDeleteCategory(category, false)}
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 text-red-600"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end pt-4">
          <Button onClick={() => onOpenChange(false)} variant="outline">
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
