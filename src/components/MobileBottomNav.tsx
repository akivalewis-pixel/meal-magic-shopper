import React from "react";
import { Home, ShoppingCart, UtensilsCrossed } from "lucide-react";
import { cn } from "@/lib/utils";

export type MobileSection = "home" | "shopping" | "meals";

interface MobileBottomNavProps {
  activeSection: MobileSection;
  onSectionChange: (section: MobileSection) => void;
}

export const MobileBottomNav = ({ activeSection, onSectionChange }: MobileBottomNavProps) => {
  const tabs: { id: MobileSection; label: string; icon: React.ReactNode }[] = [
    { id: "home", label: "Home", icon: <Home className="h-5 w-5" /> },
    { id: "shopping", label: "Shopping", icon: <ShoppingCart className="h-5 w-5" /> },
    { id: "meals", label: "Recipes", icon: <UtensilsCrossed className="h-5 w-5" /> },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border md:hidden safe-area-bottom">
      <div className="flex items-stretch justify-around">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onSectionChange(tab.id)}
            className={cn(
              "flex flex-1 flex-col items-center justify-center gap-1 py-3 px-2 min-h-[56px] transition-colors",
              "active:bg-muted touch-manipulation",
              activeSection === tab.id
                ? "text-primary font-semibold"
                : "text-muted-foreground"
            )}
          >
            {tab.icon}
            <span className="text-xs">{tab.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};
