
import React, { useState } from "react";
import { GroceryItem, GroceryCategory } from "@/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { groceryCategories } from "@/utils/constants";
import { v4 as uuidv4 } from 'uuid';

interface AddItemFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  availableStores: string[];
  onAddItem: (item: GroceryItem) => void;
}

export const AddItemForm = ({ 
  open, 
  onOpenChange, 
  availableStores,
  onAddItem 
}: AddItemFormProps) => {
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [category, setCategory] = useState<GroceryCategory>("other");
  const [store, setStore] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) return;
    
    const newItem: GroceryItem = {
      id: uuidv4(),
      name: name.trim(),
      quantity: quantity || "1",
      category,
      checked: false,
      store: store || undefined,
      recurring: false
    };
    
    onAddItem(newItem);
    onOpenChange(false);
    resetForm();
  };
  
  const resetForm = () => {
    setName("");
    setQuantity("1");
    setCategory("other");
    setStore("");
  };

  return (
    <Dialog open={open} onOpenChange={(value) => {
      if (!value) resetForm();
      onOpenChange(value);
    }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Item to Shopping List</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div>
            <Label htmlFor="item-name">Item Name</Label>
            <Input
              id="item-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter item name"
              required
              className="mt-1"
              autoFocus
            />
          </div>
          
          <div>
            <Label htmlFor="item-quantity">Quantity</Label>
            <Input
              id="item-quantity"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="e.g., 2, 1lb, 500g"
              className="mt-1"
            />
          </div>
          
          <div>
            <Label htmlFor="item-category">Category</Label>
            <Select value={category} onValueChange={(value) => setCategory(value as GroceryCategory)}>
              <SelectTrigger id="item-category" className="mt-1">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {groceryCategories.map(cat => (
                  <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="item-store">Store (optional)</Label>
            <Select value={store} onValueChange={setStore}>
              <SelectTrigger id="item-store" className="mt-1">
                <SelectValue placeholder="Select store" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">None</SelectItem>
                {availableStores.map(store => (
                  <SelectItem key={store} value={store}>{store}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Add Item</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
