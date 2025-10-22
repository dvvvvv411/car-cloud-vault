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

interface TransferButtonProps {
  inquiryId: string;
}

export const TransferButton = ({ inquiryId }: TransferButtonProps) => {
  const transferInquiry = useTransferInquiry();

  const handleTransfer = () => {
    transferInquiry.mutate({ inquiryId });
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="default"
          size="sm"
          className="gap-2 bg-green-600 hover:bg-green-700"
          disabled={transferInquiry.isPending}
        >
          {transferInquiry.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
          Übertragen
        </Button>
      </AlertDialogTrigger>
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
  );
};
