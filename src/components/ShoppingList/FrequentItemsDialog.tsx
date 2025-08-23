import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { GroceryItem, GroceryCategory } from "@/types";

interface FrequentItem {
  name: string;
  category: GroceryCategory;
  store: string;
  frequency: number;
  lastUsed: string;
}

interface FrequentItemsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAddItems: (items: Omit<GroceryItem, 'id' | 'checked'>[]) => void;
  currentItems: GroceryItem[];
}

export const FrequentItemsDialog = ({
  isOpen,
  onClose,
  onAddItems,
  currentItems
}: FrequentItemsDialogProps) => {
  const [frequentItems, setFrequentItems] = useState<FrequentItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchFrequentItems = async () => {
    setLoading(true);
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      // Get shopping list items from the last 6 months, grouped by name
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      const { data, error } = await supabase
        .from('shopping_list_items')
        .select('name, category, store, created_at')
        .eq('user_id', user.user.id)
        .gte('created_at', sixMonthsAgo.toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;

        // Group by name and find most frequent category/store combinations
        const itemGroups: Record<string, Array<{category: GroceryCategory, store: string, created_at: string}>> = {};
      
        data?.forEach(item => {
          const name = item.name.toLowerCase();
          if (!itemGroups[name]) {
            itemGroups[name] = [];
          }
          itemGroups[name].push({
            category: (item.category || 'other') as GroceryCategory,
            store: item.store || 'Unassigned',
            created_at: item.created_at
          });
        });

      // Calculate frequency and most common store/category for each item
      const frequent: FrequentItem[] = [];
      
        Object.entries(itemGroups).forEach(([name, occurrences]) => {
          if (occurrences.length >= 2) { // Only show items used at least twice
            // Find most common store and category
            const storeCounts: Record<string, number> = {};
            const categoryCounts: Partial<Record<GroceryCategory, number>> = {};
            
            occurrences.forEach(occ => {
              storeCounts[occ.store] = (storeCounts[occ.store] || 0) + 1;
              categoryCounts[occ.category] = (categoryCounts[occ.category] || 0) + 1;
            });
            
            const mostCommonStore = Object.entries(storeCounts)
              .sort(([,a], [,b]) => b - a)[0][0];
            const mostCommonCategory = Object.entries(categoryCounts)
              .sort(([,a], [,b]) => b - a)[0][0] as GroceryCategory;
          
          frequent.push({
            name: name.charAt(0).toUpperCase() + name.slice(1),
            category: mostCommonCategory,
            store: mostCommonStore,
            frequency: occurrences.length,
            lastUsed: occurrences[0].created_at
          });
        }
      });

      // Sort by frequency (descending) then by last used (most recent first)
      frequent.sort((a, b) => {
        if (b.frequency !== a.frequency) {
          return b.frequency - a.frequency;
        }
        return new Date(b.lastUsed).getTime() - new Date(a.lastUsed).getTime();
      });

      // Filter out items that are already in current shopping list
      const currentItemNames = new Set(currentItems.map(item => item.name.toLowerCase()));
      const filteredFrequent = frequent.filter(item => !currentItemNames.has(item.name.toLowerCase()));

      setFrequentItems(filteredFrequent.slice(0, 20)); // Limit to top 20
    } catch (error) {
      console.error('Error fetching frequent items:', error);
      toast({
        title: "Error",
        description: "Failed to load frequent items",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchFrequentItems();
      setSelectedItems(new Set());
    }
  }, [isOpen]);

  const handleItemToggle = (itemName: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(itemName)) {
      newSelected.delete(itemName);
    } else {
      newSelected.add(itemName);
    }
    setSelectedItems(newSelected);
  };

  const handleAddSelected = () => {
    const itemsToAdd = frequentItems
      .filter(item => selectedItems.has(item.name))
      .map(item => ({
        name: item.name,
        category: item.category,
        store: item.store,
        quantity: ''
      }));

    if (itemsToAdd.length > 0) {
      onAddItems(itemsToAdd);
      toast({
        title: "Items Added",
        description: `Added ${itemsToAdd.length} items to your shopping list`,
      });
      onClose();
    }
  };

  const formatLastUsed = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Frequent Items</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="ml-2">Loading frequent items...</span>
            </div>
          ) : frequentItems.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No frequent items found.</p>
              <p className="text-sm mt-1">Items appear here after being added to your shopping list multiple times.</p>
            </div>
          ) : (
            <>
              <div className="text-sm text-gray-600 mb-2">
                Select items to add to your current shopping list:
              </div>
              
              <ScrollArea className="h-64">
                <div className="space-y-2">
                  {frequentItems.map((item) => (
                    <div
                      key={item.name}
                      className="flex items-start space-x-3 p-2 hover:bg-gray-50 rounded-md"
                    >
                      <Checkbox
                        id={`item-${item.name}`}
                        checked={selectedItems.has(item.name)}
                        onCheckedChange={() => handleItemToggle(item.name)}
                        className="mt-1"
                      />
                      <div className="flex-1 min-w-0">
                        <label
                          htmlFor={`item-${item.name}`}
                          className="font-medium text-sm cursor-pointer"
                        >
                          {item.name}
                        </label>
                        <div className="flex flex-wrap gap-1 mt-1">
                          <Badge variant="secondary" className="text-xs">
                            {item.store}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {item.category}
                          </Badge>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Used {item.frequency} times • Last: {formatLastUsed(item.lastUsed)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              <div className="flex justify-between items-center pt-4 border-t">
                <span className="text-sm text-gray-600">
                  {selectedItems.size} item{selectedItems.size !== 1 ? 's' : ''} selected
                </span>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={onClose}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleAddSelected}
                    disabled={selectedItems.size === 0}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Selected
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};