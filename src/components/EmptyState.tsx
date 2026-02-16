import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

interface EmptyStateProps {
  icon: string;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  compact?: boolean;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  compact = false
}) => {
  return (
    <div className={`flex items-center justify-center ${compact ? "py-8" : "py-16"}`}>
      <div className="flex flex-col items-center gap-4 max-w-sm text-center px-4">
        {/* Animated Icon */}
        <div className="relative">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
            <span className="text-3xl animate-bounce">{icon}</span>
          </div>
        </div>

        {/* Title and Description */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>

        {/* Action Buttons */}
        {(actionLabel || secondaryActionLabel) && (
          <div className="flex flex-col sm:flex-row gap-2 mt-2">
            {actionLabel && onAction && (
              <Button onClick={onAction} className="gap-2">
                {actionLabel}
                <ArrowRight className="h-4 w-4" />
              </Button>
            )}
            {secondaryActionLabel && onSecondaryAction && (
              <Button variant="outline" onClick={onSecondaryAction}>
                {secondaryActionLabel}
              </Button>
            )}
          </div>
        )}

        {/* Decorative Element */}
        {!compact && (
          <div className="mt-4 w-full max-w-[200px]">
            <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />
          </div>
        )}
      </div>
    </div>
  );
};
