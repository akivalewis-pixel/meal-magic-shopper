
import React, { useState } from "react";
import { GroceryItem, GroceryCategory } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { groceryCategories } from "@/utils/constants";

interface IngredientEditDialogProps {
  item: GroceryItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (updatedItem: GroceryItem) => void;
  availableStores: string[];
}

export const IngredientEditDialog = ({
  item,
  open,
  onOpenChange,
  onSave,
  availableStores
}: IngredientEditDialogProps) => {
  const [name, setName] = useState(item?.name || "");
  const [quantity, setQuantity] = useState(item?.quantity || "");
  const [store, setStore] = useState(item?.store || "unassigned");
  const [category, setCategory] = useState<GroceryCategory>(item?.category || "other");

  React.useEffect(() => {
    if (item) {
      setName(item.name);
      setQuantity(item.quantity);
      setStore(item.store || "unassigned");
      setCategory(item.category);
    }
  }, [item]);

  const handleSave = () => {
    if (!item) return;
    
    const updatedItem: GroceryItem = {
      ...item,
      name,
      quantity,
      store: store === "unassigned" ? "" : store,
      category
    };
    
    onSave(updatedItem);
    onOpenChange(false);
  };

  if (!item) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Ingredient</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          
          <div>
            <Label htmlFor="quantity">Quantity</Label>
            <Input
              id="quantity"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
          </div>
          
          <div>
            <Label htmlFor="store">Store</Label>
            <Select value={store} onValueChange={setStore}>
              <SelectTrigger>
                <SelectValue placeholder="Select store" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unassigned">Unassigned</SelectItem>
                {availableStores.filter(s => s !== "Any Store").map(storeName => (
                  <SelectItem key={storeName} value={storeName}>
                    {storeName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={(value: GroceryCategory) => setCategory(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {groceryCategories.map(cat => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="flex justify-end space-x-2 mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
