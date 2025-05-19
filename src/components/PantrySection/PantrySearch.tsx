
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface PantrySearchProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

export const PantrySearch = ({ searchTerm, onSearchChange }: PantrySearchProps) => {
  return (
    <div className="flex-1">
      <Label htmlFor="search-pantry">Search Pantry</Label>
      <Input
        id="search-pantry"
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Search pantry items..."
      />
    </div>
  );
};
