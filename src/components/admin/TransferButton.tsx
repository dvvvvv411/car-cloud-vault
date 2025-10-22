import { Button } from "@/components/ui/button";
import { Send, Loader2 } from "lucide-react";
import { useTransferInquiry } from "@/hooks/useTransferInquiry";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface TransferButtonProps {
  inquiryId: string;
}

export const TransferButton = ({ inquiryId }: TransferButtonProps) => {
  const transferInquiry = useTransferInquiry();

  const handleTransfer = () => {
    transferInquiry.mutate({ inquiryId });
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <AlertDialog>
          <TooltipTrigger asChild>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-green-600 hover:bg-green-50"
                disabled={transferInquiry.isPending}
              >
                {transferInquiry.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </AlertDialogTrigger>
          </TooltipTrigger>
          <TooltipContent>
            <p>Anfrage übertragen</p>
          </TooltipContent>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Anfrage übertragen?</AlertDialogTitle>
              <AlertDialogDescription>
                Diese Anfrage wird an das externe System übertragen. 
                Möchten Sie fortfahren?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Abbrechen</AlertDialogCancel>
              <AlertDialogAction onClick={handleTransfer}>
                Jetzt übertragen
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </Tooltip>
    </TooltipProvider>
  );
};
