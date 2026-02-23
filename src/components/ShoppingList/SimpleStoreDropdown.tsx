
import React, { useState, useCallback, useRef } from "react";
import { GroceryItem } from "@/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface SimpleStoreDropdownProps {
  item: GroceryItem;
  availableStores: string[];
  onStoreChange: (item: GroceryItem) => void;
  onAddStore?: (store: string) => void;
}

export const SimpleStoreDropdown = React.memo(({
  item,
  availableStores,
  onStoreChange,
  onAddStore
}: SimpleStoreDropdownProps) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newStoreName, setNewStoreName] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const isMobile = useIsMobile();

  const handleChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStore = e.target.value;
    
    if (newStore === "__add_new__") {
      setIsAddingNew(true);
      setTimeout(() => inputRef.current?.focus(), 50);
      return;
    }
    
    setIsUpdating(true);
    
    const updatedItem = { 
      ...item, 
      store: newStore,
      __updateTimestamp: Date.now()
    };
    
    onStoreChange(updatedItem);
    setTimeout(() => setIsUpdating(false), 300);
  }, [item, onStoreChange]);

  const handleAddNewStore = useCallback(() => {
    const trimmed = newStoreName.trim();
    if (!trimmed) return;
    
    if (onAddStore) {
      onAddStore(trimmed);
    }
    
    // Immediately assign this store to the item
    const updatedItem = { 
      ...item, 
      store: trimmed,
      __updateTimestamp: Date.now()
    };
    onStoreChange(updatedItem);
    
    setNewStoreName("");
    setIsAddingNew(false);
  }, [newStoreName, item, onStoreChange, onAddStore]);

  const currentStore = item.store || "Unassigned";

  if (isAddingNew) {
    return (
      <div className="flex items-center gap-1">
        <Input
          ref={inputRef}
          value={newStoreName}
          onChange={(e) => setNewStoreName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleAddNewStore();
            if (e.key === "Escape") { setIsAddingNew(false); setNewStoreName(""); }
          }}
          className="w-24 h-8 text-xs"
          placeholder="Store name"
          autoFocus
        />
        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={handleAddNewStore}>
          <Plus className="h-3 w-3" />
        </Button>
      </div>
    );
  }

  return (
    <div className="relative">
      <select
        value={currentStore}
        onChange={handleChange}
        className={`${isMobile ? 'w-28' : 'w-32'} h-8 text-xs bg-background border rounded px-2 focus:outline-none focus:ring-2 focus:ring-ring transition-all duration-200 ${
          isUpdating 
            ? 'border-primary bg-primary/10 shadow-sm' 
            : 'border-input hover:border-muted-foreground'
        }`}
        disabled={isUpdating}
      >
        <option value="Unassigned">Unassigned</option>
        {availableStores
          .filter(store => store !== "Unassigned")
          .map(store => (
            <option key={store} value={store}>
              {store}
            </option>
          ))}
        <option value="__add_new__">+ Add store...</option>
      </select>
      {isUpdating && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full animate-pulse shadow-sm"></div>
      )}
    </div>
  );
});

SimpleStoreDropdown.displayName = 'SimpleStoreDropdown';
