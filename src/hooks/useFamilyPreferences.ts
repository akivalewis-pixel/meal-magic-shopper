
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { FamilyPreference } from "@/types";

// Default empty array since we removed sampleFamilyPreferences from constants
const defaultFamilyPreferences: FamilyPreference[] = [];

export function useFamilyPreferences() {
  const { toast } = useToast();
  const [familyPreferences, setFamilyPreferences] = useState<FamilyPreference[]>([]);

  // Initialize with saved data or empty array
  useEffect(() => {
    const savedFamilyPreferences = localStorage.getItem('mealPlannerFamilyPreferences');
    const initialFamilyPreferences = savedFamilyPreferences 
      ? JSON.parse(savedFamilyPreferences) 
      : defaultFamilyPreferences;
    
    setFamilyPreferences(initialFamilyPreferences);
  }, []);

  // Save to localStorage when state changes
  useEffect(() => {
    if (familyPreferences.length > 0) {
      localStorage.setItem('mealPlannerFamilyPreferences', JSON.stringify(familyPreferences));
    }
  }, [familyPreferences]);

  const handleAddFamilyMember = (preference: FamilyPreference) => {
    setFamilyPreferences(prevPreferences => [...prevPreferences, preference]);
    
    toast({
      title: "Family Member Added",
      description: `Preferences for ${preference.familyMember} have been added`,
    });
  };

  const handleRemoveFamilyMember = (id: string) => {
    const memberToRemove = familyPreferences.find(p => p.id === id);
    
    if (memberToRemove) {
      setFamilyPreferences(prevPreferences => 
        prevPreferences.filter(p => p.id !== id)
      );
      
      toast({
        title: "Family Member Removed",
        description: `${memberToRemove.familyMember} has been removed`,
      });
    }
  };

  const handleUpdateFamilyPreference = (updatedPreference: FamilyPreference) => {
    setFamilyPreferences(prevPreferences =>
      prevPreferences.map(p =>
        p.id === updatedPreference.id ? updatedPreference : p
      )
    );
  };

  return {
    familyPreferences,
    handleAddFamilyMember,
    handleRemoveFamilyMember,
    handleUpdateFamilyPreference
  };
}
