
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { samplePantryItems } from "@/utils/mealPlannerUtils";

export function usePantry() {
  const { toast } = useToast();
  const [pantryItems, setPantryItems] = useState<string[]>([]);

  // Initialize with sample data or saved data
  useEffect(() => {
    const savedPantryItems = localStorage.getItem('mealPlannerPantryItems');
    const initialPantryItems = savedPantryItems ? JSON.parse(savedPantryItems) : samplePantryItems;
    setPantryItems(initialPantryItems);
  }, []);

  // Save to localStorage when state changes
  useEffect(() => {
    if (pantryItems.length > 0) {
      localStorage.setItem('mealPlannerPantryItems', JSON.stringify(pantryItems));
    }
  }, [pantryItems]);

  const handleAddPantryItem = (item: string) => {
    if (!pantryItems.includes(item)) {
      setPantryItems([...pantryItems, item]);
      toast({
        title: "Pantry Updated",
        description: `Added ${item} to your pantry`,
      });
    } else {
      toast({
        title: "Item already exists",
        description: `${item} is already in your pantry`,
        variant: "destructive",
      });
    }
  };

  const handleRemovePantryItem = (item: string) => {
    setPantryItems(pantryItems.filter((i) => i !== item));
    toast({
      title: "Pantry Updated",
      description: `Removed ${item} from your pantry`,
    });
  };

  return {
    pantryItems,
    handleAddPantryItem,
    handleRemovePantryItem
  };
}
