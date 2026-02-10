import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Clock, Loader2, ArrowRight } from "lucide-react";
import { useAmtsgerichtHistory } from "@/hooks/useAmtsgerichtHistory";
import { format } from "date-fns";
import { de } from "date-fns/locale";

const getStatusBadgeColor = (status: string) => {
  switch (status) {
    case "Amtsgericht":
      return "bg-lime-100 text-lime-800 border-lime-300";
    case "Amtsgericht Ready":
      return "bg-emerald-200 text-emerald-900 border-emerald-400";
    case "Kein Interesse":
      return "bg-red-100 text-red-800 border-red-300";
    default:
      return "bg-muted text-muted-foreground";
  }
};

export const AmtsgerichtHistoryDialog = () => {
  const { data: history = [], isLoading } = useAmtsgerichtHistory();

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Clock className="h-4 w-4" />
          History
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Amtsgericht Status-Verlauf</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh]">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : history.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              Noch keine Statusänderungen vorhanden.
            </p>
          ) : (
            <div className="space-y-3 pr-4">
              {history.map((entry) => (
                <div
                  key={entry.id}
                  className="flex flex-col gap-1.5 p-3 rounded-lg border border-border/40 bg-muted/20"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">
                      {entry.inquiry_name || "Unbekannt"}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(entry.changed_at), "dd.MM.yy HH:mm", { locale: de })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={`text-xs ${getStatusBadgeColor(entry.old_status)}`}>
                      {entry.old_status}
                    </Badge>
                    <ArrowRight className="h-3 w-3 text-muted-foreground" />
                    <Badge variant="outline" className={`text-xs ${getStatusBadgeColor(entry.new_status)}`}>
                      {entry.new_status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
