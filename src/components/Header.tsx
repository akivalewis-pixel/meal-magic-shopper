
import React from "react";
import { Utensils } from "lucide-react";

export const Header = () => {
  return (
    <header className="bg-leaf px-4 py-3 text-white shadow-md">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Utensils className="h-6 w-6" />
          <div>
            <h1 className="text-xl font-bold">Pantry Pilot</h1>
            <p className="text-xs opacity-80">navigating your meals with precision</p>
          </div>
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
          </ul>
        </nav>
      </div>
    </header>
  );
};
