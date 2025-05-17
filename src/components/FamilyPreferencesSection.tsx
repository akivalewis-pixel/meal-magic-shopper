
import React, { useState } from "react";
import { FamilyPreference, DietaryPreference } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash, ArrowRight, X } from "lucide-react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { dietaryOptions } from "@/utils/mealPlannerUtils";

interface FamilyPreferencesSectionProps {
  preferences: FamilyPreference[];
  onEditPreference: (preference: FamilyPreference) => void;
  onAddPreference?: (preference: FamilyPreference) => void;
  onRemovePreference?: (id: string) => void;
  onUpdatePreference?: (preference: FamilyPreference) => void;
}

const ItemTypes = {
  PREFERENCE_ITEM: 'preference_item'
};

const PreferenceItemList = ({ 
  title, 
  items, 
  type, 
  onAdd, 
  onRemove, 
  familyMember, 
  canDrag = true, 
  bgColor = "bg-slate-100" 
}) => {
  const [newItem, setNewItem] = useState("");
  
  const [, drop] = useDrop(() => ({
    accept: ItemTypes.PREFERENCE_ITEM,
    drop: (item: { content: string, type: string, familyMember: string }) => {
      if (item.familyMember === familyMember && item.type !== type) {
        onAdd(item.content);
        onRemove(item.content, item.type);
      }
      return { name: type };
    }
  }));

  const handleAddItem = (e) => {
    e.preventDefault();
    if (newItem.trim()) {
      onAdd(newItem.trim());
      setNewItem("");
    }
  };

  return (
    <div ref={canDrag ? drop : null} className={`${bgColor} p-3 rounded-md h-full`}>
      <h4 className="font-medium mb-2 flex justify-between items-center">
        {title}
        <form onSubmit={handleAddItem} className="flex">
          <Input 
            value={newItem} 
            onChange={(e) => setNewItem(e.target.value)}
            placeholder="Add new..."
            className="h-7 text-xs mr-1"
          />
          <Button type="submit" size="sm" variant="ghost" className="h-7 px-2">
            <Plus className="h-4 w-4" />
          </Button>
        </form>
      </h4>
      <div className="flex flex-wrap gap-1 min-h-[50px]">
        {items.length > 0 ? (
          items.map((item, index) => (
            <DraggablePreferenceItem
              key={index}
              content={item}
              type={type}
              familyMember={familyMember}
              onRemove={() => onRemove(item, type)}
              canDrag={canDrag}
            />
          ))
        ) : (
          <span className="text-sm text-gray-500">None specified</span>
        )}
      </div>
    </div>
  );
};

const DraggablePreferenceItem = ({ content, type, familyMember, onRemove, canDrag = true }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.PREFERENCE_ITEM,
    item: { content, type, familyMember },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging()
    }),
    canDrag: canDrag
  }));

  const badgeVariant = type === "likes" 
    ? "outline" 
    : type === "dislikes" 
      ? "outline" 
      : "default";

  const badgeClass = type === "likes" 
    ? "bg-green-100" 
    : type === "dislikes" 
      ? "bg-red-100" 
      : "";

  return (
    <Badge 
      ref={canDrag ? drag : null} 
      variant={badgeVariant} 
      className={`${badgeClass} ${isDragging ? 'opacity-50' : 'opacity-100'} cursor-move flex items-center gap-1`}
    >
      {content}
      <X 
        className="h-3 w-3 cursor-pointer hover:text-red-500" 
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
      />
    </Badge>
  );
};

export const FamilyPreferencesSection = ({
  preferences,
  onEditPreference,
  onAddPreference,
  onRemovePreference,
  onUpdatePreference
}: FamilyPreferencesSectionProps) => {
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editingPreference, setEditingPreference] = useState<FamilyPreference | null>(null);

  const form = useForm({
    defaultValues: {
      familyMember: "",
      diet: "none" as DietaryPreference
    }
  });

  const editForm = useForm({
    defaultValues: {
      familyMember: "",
      diet: "none" as DietaryPreference
    }
  });

  const handleAddFamilyMember = (data) => {
    if (onAddPreference) {
      const newPreference: FamilyPreference = {
        id: Date.now().toString(),
        familyMember: data.familyMember,
        likes: [],
        dislikes: [],
        allergies: [],
        dietaryPreferences: [data.diet]
      };
      onAddPreference(newPreference);
      setAddModalOpen(false);
      form.reset();
    }
  };

  const handleAddItem = (familyMember: string, item: string, type: "likes" | "dislikes" | "allergies") => {
    if (onUpdatePreference) {
      const preference = preferences.find(p => p.familyMember === familyMember);
      if (preference && !preference[type].includes(item)) {
        const updatedPreference = {
          ...preference,
          [type]: [...preference[type], item]
        };
        onUpdatePreference(updatedPreference);
      }
    }
  };

  const handleRemoveItem = (familyMember: string, item: string, type: "likes" | "dislikes" | "allergies") => {
    if (onUpdatePreference) {
      const preference = preferences.find(p => p.familyMember === familyMember);
      if (preference) {
        const updatedPreference = {
          ...preference,
          [type]: preference[type].filter(i => i !== item)
        };
        onUpdatePreference(updatedPreference);
      }
    }
  };

  const handleEditPreference = (preference: FamilyPreference) => {
    setEditingPreference(preference);
    editForm.setValue("familyMember", preference.familyMember);
    editForm.setValue("diet", preference.dietaryPreferences[0] || "none");
  };

  const handleSaveEdit = (data) => {
    if (editingPreference && onUpdatePreference) {
      const updatedPreference = {
        ...editingPreference,
        familyMember: data.familyMember,
        dietaryPreferences: [data.diet]
      };
      onUpdatePreference(updatedPreference);
      setEditingPreference(null);
    }
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <section id="family-preferences" className="py-8">
        <div className="container mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-tomato-dark">Family Preferences</h2>
            <Button variant="outline" onClick={() => setAddModalOpen(true)}>
              <Plus className="h-4 w-4 mr-1" /> Add Family Member
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {preferences.map((preference) => (
              <Card key={preference.id} className="h-full">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle>{preference.familyMember}</CardTitle>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => handleEditPreference(preference)}>
                      Edit
                    </Button>
                    {onRemovePreference && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => onRemovePreference(preference.id)}
                      >
                        <Trash className="h-4 w-4 text-red-500" />
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <PreferenceItemList
                      title="Likes"
                      items={preference.likes}
                      type="likes"
                      familyMember={preference.familyMember}
                      onAdd={(item) => handleAddItem(preference.familyMember, item, "likes")}
                      onRemove={(item, type) => handleRemoveItem(preference.familyMember, item, type)}
                      bgColor="bg-green-50"
                    />

                    <PreferenceItemList
                      title="Dislikes"
                      items={preference.dislikes}
                      type="dislikes"
                      familyMember={preference.familyMember}
                      onAdd={(item) => handleAddItem(preference.familyMember, item, "dislikes")}
                      onRemove={(item, type) => handleRemoveItem(preference.familyMember, item, type)}
                      bgColor="bg-red-50"
                    />

                    <PreferenceItemList
                      title="Allergies"
                      items={preference.allergies}
                      type="allergies"
                      familyMember={preference.familyMember}
                      onAdd={(item) => handleAddItem(preference.familyMember, item, "allergies")}
                      onRemove={(item, type) => handleRemoveItem(preference.familyMember, item, type)}
                      bgColor="bg-yellow-50"
                      canDrag={false}
                    />

                    <div>
                      <h4 className="font-medium mb-1">Dietary Preferences:</h4>
                      <div className="flex flex-wrap gap-1">
                        {preference.dietaryPreferences.length > 0 &&
                        preference.dietaryPreferences[0] !== "none" ? (
                          preference.dietaryPreferences.map((diet, index) => (
                            <Badge key={index} variant="secondary">
                              {diet}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-sm text-gray-500">None</span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Add Family Member Dialog */}
        <Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Family Member</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleAddFamilyMember)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="familyMember"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter name" {...field} required />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="diet"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dietary Preference</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select diet" />
                        </SelectTrigger>
                        <SelectContent>
                          {dietaryOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
                
                <div className="flex justify-end gap-2">
                  <Button variant="outline" type="button" onClick={() => setAddModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    Add
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Edit Family Member Dialog */}
        <Dialog open={!!editingPreference} onOpenChange={(open) => !open && setEditingPreference(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Family Member</DialogTitle>
            </DialogHeader>
            {editingPreference && (
              <Form {...editForm}>
                <form onSubmit={editForm.handleSubmit(handleSaveEdit)} className="space-y-4">
                  <FormField
                    control={editForm.control}
                    name="familyMember"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter name" {...field} required />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={editForm.control}
                    name="diet"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Dietary Preference</FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select diet" />
                          </SelectTrigger>
                          <SelectContent>
                            {dietaryOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" type="button" onClick={() => setEditingPreference(null)}>
                      Cancel
                    </Button>
                    <Button type="submit">
                      Save
                    </Button>
                  </div>
                </form>
              </Form>
            )}
          </DialogContent>
        </Dialog>
      </section>
    </DndProvider>
  );
};
