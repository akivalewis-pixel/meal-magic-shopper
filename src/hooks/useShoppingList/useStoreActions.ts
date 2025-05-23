
import { useToast } from "@/hooks/use-toast";

interface UseStoreActionsProps {
  setAvailableStores: (stores: string[]) => void;
}

export const useStoreActions = ({
  setAvailableStores
}: UseStoreActionsProps) => {
  const { toast } = useToast();

  const handleUpdateStores = (stores: string[]) => {
    setAvailableStores(stores);
    toast({
      title: "Stores Updated",
      description: `Your store list has been updated`,
    });
  };

  return {
    handleUpdateStores
  };
};
