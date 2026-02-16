import React from "react";
import { Loader2, UtensilsCrossed } from "lucide-react";

export const LoadingState: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-6 p-8">
        {/* Animated Icon */}
        <div className="relative">
          <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center animate-pulse">
            <UtensilsCrossed className="h-10 w-10 text-primary" />
          </div>
          <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
            <Loader2 className="h-4 w-4 text-primary animate-spin" />
          </div>
        </div>

        {/* Loading Text */}
        <div className="text-center space-y-2">
          <h2 className="text-xl font-semibold text-foreground">
            Loading Your Meal Plan
          </h2>
          <p className="text-sm text-muted-foreground max-w-[250px]">
            Preparing your personalized meal planning experience
          </p>
        </div>

        {/* Progress Dots */}
        <div className="flex gap-1.5">
          <div className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:0ms]" />
          <div className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:150ms]" />
          <div className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:300ms]" />
        </div>

        {/* Helpful Tip */}
        <div className="mt-4 px-4 py-3 bg-muted rounded-xl max-w-[300px]">
          <p className="text-xs text-muted-foreground text-center">
            💡 Pro tip: You can save your favorite weekly plans for quick reuse
          </p>
        </div>
      </div>
    </div>
  );
};
