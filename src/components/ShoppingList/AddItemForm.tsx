
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCustomCategories } from "@/contexts/CustomCategoriesContext";
import { GroceryItem } from "@/types";
import { v4 as uuidv4 } from "uuid";

interface AddItemFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  availableStores: string[];
  onAddItem: (item: GroceryItem) => void;
  archivedItems?: GroceryItem[];
  onSearchArchivedItems?: (searching: boolean) => void;
  isSearchingArchived?: boolean;
}

export const AddItemForm = ({ 
  open, 
  onOpenChange, 
  availableStores, 
  onAddItem,
  archivedItems = [],
  onSearchArchivedItems,
  isSearchingArchived = false
}: AddItemFormProps) => {
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [category, setCategory] = useState("other");
  const [store, setStore] = useState("Unassigned"); // Default to "Unassigned"
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<"add" | "search">("add");
  const { getAllCategories, getCategoryDisplayName } = useCustomCategories();
  
  useEffect(() => {
    if (onSearchArchivedItems) {
      onSearchArchivedItems(activeTab === "search");
    }
  }, [activeTab, onSearchArchivedItems]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newItem: GroceryItem = {
      id: uuidv4(),
      name: name.trim(),
      quantity: quantity || "1",
      category: category as any,
      checked: false,
      store: store // Use the selected store value directly
    };

    console.log("AddItemForm: Creating new item:", newItem);
    onAddItem(newItem);
    onOpenChange(false);
    resetForm();
  };

  const resetForm = () => {
    setName("");
    setQuantity("1");
    setCategory("other");
    setStore("Unassigned"); // Reset to "Unassigned"
    setSearchTerm("");
    setActiveTab("add");
  };

  return (
    <Dialog 
      open={open} 
      onOpenChange={(value) => {
        if (!value) resetForm();
        onOpenChange(value);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Shopping List</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "add" | "search")} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="add">Add New Item</TabsTrigger>
            <TabsTrigger value="search">Search Archive</TabsTrigger>
          </TabsList>
          
          <TabsContent value="add" className="pt-4">
            <form onSubmit={handleSubmit} className="space-y-4 py-4">
              <div>
                <Label htmlFor="item-name">Item Name</Label>
                <Input 
                  id="item-name" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter item name"
                  className="mt-1"
                  required
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
                <Select
                  value={category}
                  onValueChange={(value) => setCategory(value)}
                >
                  <SelectTrigger id="item-category" className="mt-1">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {getAllCategories().map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {getCategoryDisplayName(cat)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="item-store">Store</Label>
                <Select
                  value={store}
                  onValueChange={(value) => setStore(value)}
                >
                  <SelectTrigger id="item-store" className="mt-1">
                    <SelectValue placeholder="Select store" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Unassigned">Unassigned</SelectItem>
                    {availableStores
                      .filter(storeName => storeName !== "Unassigned")
                      .map((storeName) => (
                        <SelectItem key={storeName} value={storeName}>
                          {storeName}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <DialogFooter>
                <Button type="submit">Add Item</Button>
              </DialogFooter>
            </form>
          </TabsContent>
          
          <TabsContent value="search" className="pt-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="archive-search">Search Archived Items</Label>
                <Input 
                  id="archive-search" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search archived items..."
                  className="mt-1"
                  autoFocus
                />
              </div>
              
              <p className="text-sm text-muted-foreground">
                {archivedItems.length} items in archive. Use the search field to find archived items.
              </p>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
              </DialogFooter>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
