
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface PantryFormProps {
  onAddItem: (item: string) => void;
  pantryItems: string[];
}

export const PantryForm = ({ onAddItem, pantryItems }: PantryFormProps) => {
  const [newItem, setNewItem] = useState("");
  const { toast } = useToast();

  const handleAddItem = () => {
    if (newItem.trim() !== "") {
      // Check for case-insensitive duplicates
      const isDuplicate = pantryItems.some(
        item => item.toLowerCase() === newItem.trim().toLowerCase()
      );
      
      if (!isDuplicate) {
        onAddItem(newItem.trim());
        setNewItem("");
      } else {
        toast({
          title: "Item already exists",
          description: `${newItem.trim()} is already in your pantry`,
          variant: "destructive",
        });
      }
    }
  };

  return (
    <div className="flex-1">
      <Label htmlFor="add-item">Add Item to Pantry</Label>
      <div className="flex gap-2">
        <Input
          id="add-item"
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          placeholder="e.g., flour, sugar, salt"
          onKeyDown={(e) => e.key === "Enter" && handleAddItem()}
        />
        <Button onClick={handleAddItem}>Add</Button>
      </div>
    </div>
  );
};
