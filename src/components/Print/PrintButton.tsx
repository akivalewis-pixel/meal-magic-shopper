
import React from "react";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { PrintButtonProps } from "./types";
import { usePrintLogic } from "./usePrintLogic";

export const PrintButton = ({ meals, groceryItems, getCurrentItems }: PrintButtonProps) => {
  const { handlePrint } = usePrintLogic();

  const onPrintClick = () => {
    handlePrint(meals, groceryItems, getCurrentItems);
  };

  return (
    <Button 
      onClick={onPrintClick} 
      variant="outline" 
      className="print-button flex items-center gap-2"
    >
      <Printer size={18} />
      <span>Print Menu & Shopping List</span>
    </Button>
  );
};
