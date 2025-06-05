
import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { LogOut, User } from "lucide-react";

export const Header = () => {
  const { user, signOut } = useAuth();

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Weekly Meal Planner
            </h1>
            <p className="text-gray-600 text-sm sm:text-base">
              Plan your meals, create shopping lists, and stay organized
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">{user?.email}</span>
            </div>
            <Button
              onClick={signOut}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};
