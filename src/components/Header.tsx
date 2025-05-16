
import React from "react";
import { Utensils } from "lucide-react";

export const Header = () => {
  return (
    <header className="bg-leaf px-4 py-3 text-white shadow-md">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Utensils className="h-6 w-6" />
          <h1 className="text-xl font-bold">Family Meal Planner</h1>
        </div>
        <nav className="hidden md:block">
          <ul className="flex gap-6">
            <li>
              <a href="#meal-plan" className="hover:underline">
                Meal Plan
              </a>
            </li>
            <li>
              <a href="#shopping-list" className="hover:underline">
                Shopping List
              </a>
            </li>
            <li>
              <a href="#family-preferences" className="hover:underline">
                Family Preferences
              </a>
            </li>
            <li>
              <a href="#pantry" className="hover:underline">
                Pantry
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};
