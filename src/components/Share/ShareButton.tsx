import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Share2 } from "lucide-react";
import { ShareDialog } from "./ShareDialog";

interface ShareButtonProps {
  title: string;
  content: string;
  type: "meal-plan" | "daily-plan" | "recipe" | "shopping-list";
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
  className?: string;
  children?: React.ReactNode;
}

export const ShareButton = ({ 
  title, 
  content, 
  type, 
  variant = "outline", 
  size = "sm",
  className,
  children 
}: ShareButtonProps) => {
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={() => setIsShareDialogOpen(true)}
        className={className}
      >
        <Share2 className="h-4 w-4 mr-2" />
        {children || "Share"}
      </Button>
      
      <ShareDialog
        isOpen={isShareDialogOpen}
        onClose={() => setIsShareDialogOpen(false)}
        title={title}
        content={content}
        type={type}
      />
    </>
  );
};