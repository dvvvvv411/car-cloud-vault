import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Copy } from "lucide-react";

interface DekraNumbersDialogProps {
  reportNumbers: string[];
}

export const DekraNumbersDialog = ({ reportNumbers }: DekraNumbersDialogProps) => {
  // Filter out undefined/null/empty values and add fallback
  const validReportNumbers = reportNumbers.filter(nr => nr && nr.trim() !== '');
  const reportNumbersText = validReportNumbers.length > 0 
    ? validReportNumbers.join('\n') 
    : 'Keine DEKRA-Nummern verfügbar';

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-7 text-xs px-2"
        >
          <Copy className="h-3 w-3 mr-1" />
          DEKRA-Nummern kopieren
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>DEKRA-Nummern ({validReportNumbers.length})</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Markieren Sie die Nummern und kopieren Sie sie mit Strg+C (oder Cmd+C auf Mac)
          </p>
          <Textarea
            value={reportNumbersText}
            readOnly
            className="min-h-[200px] font-mono text-sm"
            onClick={(e) => e.currentTarget.select()}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
