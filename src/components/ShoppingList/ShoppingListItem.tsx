
import React from "react";
import { GroceryItem } from "@/types";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Repeat } from "lucide-react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

interface ShoppingListItemProps {
  item: GroceryItem;
  onToggle: (id: string) => void;
  onQuantityChange: (item: GroceryItem, quantity: string) => void;
  onStoreChange: (item: GroceryItem, store: string) => void;
  onToggleRecurring: (item: GroceryItem) => void;
  availableStores: string[];
}

export const ShoppingListItem = ({
  item,
  onToggle,
  onQuantityChange,
  onStoreChange,
  onToggleRecurring,
  availableStores
}: ShoppingListItemProps) => {
  // Local state to track input value for better UX
  const [quantityValue, setQuantityValue] = React.useState(item.quantity);

  // Update local state when item.quantity changes
  React.useEffect(() => {
    setQuantityValue(item.quantity);
  }, [item.quantity]);

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

  return (
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
        >
          <Repeat className={`h-4 w-4 ${item.recurring ? 'text-blue-500' : 'text-gray-400'}`} />
        </Button>
      </div>
    </li>
  );
};
