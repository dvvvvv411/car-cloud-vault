import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Copy } from "lucide-react";
import { Inquiry } from "@/hooks/useInquiries";

interface CustomerInfoDialogProps {
  inquiry: Inquiry;
  trigger?: React.ReactNode;
}

export const CustomerInfoDialog = ({ inquiry, trigger }: CustomerInfoDialogProps) => {
  // Format customer info based on customer_type
  const customerInfo = inquiry.customer_type === 'business'
    ? `${inquiry.company_name}\n${inquiry.street}\n${inquiry.zip_code} ${inquiry.city}\n${inquiry.first_name} ${inquiry.last_name}`
    : `${inquiry.first_name} ${inquiry.last_name}\n${inquiry.street}\n${inquiry.zip_code} ${inquiry.city}\n${inquiry.first_name} ${inquiry.last_name}`;

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || (
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-xs px-2"
          >
            <Copy className="h-3 w-3 mr-1" />
            Copy
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Kundeninformationen</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Markieren Sie die Informationen und kopieren Sie sie mit Strg+C (oder Cmd+C auf Mac)
          </p>
          <Textarea
            value={customerInfo}
            readOnly
            className="min-h-[150px] font-mono text-sm"
            onClick={(e) => e.currentTarget.select()}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
