
import React, { useState, useEffect } from "react";
import { GroceryItem } from "@/types";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Repeat, Edit } from "lucide-react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface ShoppingListItemProps {
  item: GroceryItem;
  onToggle: (id: string) => void;
  onQuantityChange: (item: GroceryItem, quantity: string) => void;
  onStoreChange: (item: GroceryItem, store: string) => void;
  onToggleRecurring: (item: GroceryItem) => void;
  onNameChange?: (item: GroceryItem, name: string) => void;
  availableStores: string[];
}

export const ShoppingListItem = ({
  item,
  onToggle,
  onQuantityChange,
  onStoreChange,
  onToggleRecurring,
  onNameChange,
  availableStores
}: ShoppingListItemProps) => {
  // Local state to track input values for better UX
  const [quantityValue, setQuantityValue] = useState(item.quantity);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(item.name);

  // Update local state when item properties change
  useEffect(() => {
    setQuantityValue(item.quantity);
    setEditName(item.name);
  }, [item.quantity, item.name]);

  // Handle quantity change
  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuantityValue(e.target.value);
  };

  // Handle blur event to apply changes
  const handleQuantityBlur = () => {
    if (quantityValue !== item.quantity) {
      onQuantityChange(item, quantityValue);
    }
  };

  // Handle keydown event to apply changes on Enter
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleQuantityBlur();
      e.currentTarget.blur();
    }
  };
  
  // Handle name edit submission
  const handleNameSubmit = () => {
    if (editName !== item.name && onNameChange) {
      onNameChange(item, editName);
    }
    setIsEditing(false);
  };

  return (
    <>
      <li className="flex items-center gap-3 flex-wrap">
        <Checkbox
          id={item.id}
          checked={item.checked}
          onCheckedChange={() => onToggle(item.id)}
        />
        <Label
          htmlFor={item.id}
          className={`flex flex-1 justify-between items-center ${
            item.checked ? "line-through text-gray-400" : ""
          }`}
        >
          <div className="flex items-center gap-2">
            <span>{item.name}</span>
            {item.recurring && (
              <Repeat className="h-4 w-4 text-blue-500" />
            )}
            {item.meal && (
              <span className="text-xs text-gray-500">({item.meal})</span>
            )}
          </div>
        </Label>
        
        <div className="flex items-center gap-2 ml-auto sm:ml-0">
          <Input
            className="w-[80px] h-8 text-sm"
            value={quantityValue}
            onChange={handleQuantityChange}
            onBlur={handleQuantityBlur}
            onKeyDown={handleKeyDown}
            onClick={(e) => e.stopPropagation()}
          />
          
          <Select 
            value={item.store || ""}
            onValueChange={(value) => onStoreChange(item, value)}
          >
            <SelectTrigger className="w-[120px] h-8 text-xs">
              <SelectValue placeholder="Select Store" />
            </SelectTrigger>
            <SelectContent>
              {availableStores.map(store => (
                <SelectItem key={store} value={store}>{store}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="sm"
            className="h-8 px-2"
            onClick={() => onToggleRecurring(item)}
            title={item.recurring ? "Remove from recurring items" : "Add to recurring items"}
          >
            <Repeat className={`h-4 w-4 ${item.recurring ? 'text-blue-500' : 'text-gray-400'}`} />
          </Button>
          
          {onNameChange && (
            <Button
              variant="outline"
              size="sm"
              className="h-8 px-2"
              onClick={() => setIsEditing(true)}
              title="Edit item name"
            >
              <Edit className="h-4 w-4" />
            </Button>
          )}
        </div>
      </li>

      {/* Edit Name Dialog */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Item Name</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="item-name">Item Name</Label>
            <Input 
              id="item-name" 
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleNameSubmit()}
              className="mt-2"
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
            <Button onClick={handleNameSubmit}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
