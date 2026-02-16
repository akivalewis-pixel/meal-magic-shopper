import React from "react";
import { AlertCircle, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorStateProps {
  error: Error | string;
  onRetry?: () => void;
  onGoHome?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  error,
  onRetry,
  onGoHome
}) => {
  const errorMessage = typeof error === "string" ? error : error.message;
  const isNetworkError =
    errorMessage.toLowerCase().includes("network") ||
    errorMessage.toLowerCase().includes("fetch") ||
    errorMessage.toLowerCase().includes("connection");

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="flex flex-col items-center gap-6 max-w-md w-full">
        {/* Error Icon */}
        <div className="relative">
          <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertCircle className="h-10 w-10 text-destructive" />
          </div>
        </div>

        {/* Error Message */}
        <div className="text-center space-y-3">
          <h2 className="text-xl font-semibold text-foreground">
            {isNetworkError ? "Connection Problem" : "Something Went Wrong"}
          </h2>
          <p className="text-sm text-muted-foreground">
            {isNetworkError
              ? "We're having trouble connecting to our servers. Please check your internet connection and try again."
              : "We encountered an error loading your meal plan. Don't worry, your data is safe."}
          </p>

          {/* Generic guidance - no technical details exposed */}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          {onRetry && (
            <Button onClick={onRetry} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Try Again
            </Button>
          )}
          {onGoHome && (
            <Button variant="outline" onClick={onGoHome} className="gap-2">
              <Home className="h-4 w-4" />
              Go to Home
            </Button>
          )}
        </div>

        {/* Help Text */}
        <div className="mt-2">
          <p className="text-xs text-muted-foreground text-center">
            Need help? Try refreshing the page or contact support
          </p>
        </div>
      </div>
    </div>
  );
};
