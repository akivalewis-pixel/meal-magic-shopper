
import React, { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, X } from "lucide-react";

interface StoreManagementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stores: string[];
  onSaveStores: (stores: string[]) => void;
}

export const StoreManagementDialog = ({
  open,
  onOpenChange,
  stores,
  onSaveStores
}: StoreManagementDialogProps) => {
  const [storeInput, setStoreInput] = useState("");
  const [editableStores, setEditableStores] = useState<string[]>([...stores]);

  // Reset editable stores when dialog opens
  React.useEffect(() => {
    if (open) {
      setEditableStores([...stores]);
    }
  }, [open, stores]);

  const handleAddStore = () => {
    if (storeInput.trim() && !editableStores.includes(storeInput.trim())) {
      setEditableStores([...editableStores, storeInput.trim()]);
      setStoreInput("");
    }
  };
  
  const handleRemoveStore = (store: string) => {
    setEditableStores(editableStores.filter(s => s !== store));
  };
  
  const handleSaveStores = () => {
    onSaveStores(editableStores);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Customize Store Names</DialogTitle>
          <DialogDescription>
            Add, edit or remove stores to organize your shopping list.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <div className="flex items-end gap-2 mb-4">
            <div className="flex-1">
              <Label htmlFor="new-store">Add New Store</Label>
              <Input 
                id="new-store" 
                value={storeInput}
                onChange={(e) => setStoreInput(e.target.value)}
                placeholder="Enter store name"
                onKeyDown={(e) => e.key === "Enter" && handleAddStore()}
              />
            </div>
            <Button onClick={handleAddStore}>
              <Plus className="h-4 w-4 mr-1" /> Add
            </Button>
          </div>
          
          <div className="space-y-2">
            <Label>Current Stores</Label>
            {editableStores.map(store => (
              <div key={store} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                <span>{store}</span>
                <Button variant="ghost" size="sm" onClick={() => handleRemoveStore(store)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
            {editableStores.length === 0 && (
              <p className="text-sm text-gray-500 py-2">No stores added yet</p>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSaveStores}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
