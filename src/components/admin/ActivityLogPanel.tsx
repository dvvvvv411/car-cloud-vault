import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Activity, ChevronDown, ChevronUp, ArrowRight, MessageSquarePlus, Loader2 } from "lucide-react";
import { useInquiryActivityLog } from "@/hooks/useInquiryActivityLog";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { cn } from "@/lib/utils";

const STATUS_COLORS: Record<string, { bg: string; border: string; text: string; badge: string }> = {
  "Neu": { bg: "bg-blue-50", border: "border-l-blue-500", text: "text-blue-900", badge: "bg-blue-100 text-blue-800 border-blue-300" },
  "Möchte RG/KV": { bg: "bg-orange-50", border: "border-l-orange-500", text: "text-orange-900", badge: "bg-orange-100 text-orange-800 border-orange-300" },
  "Amtsgericht": { bg: "bg-lime-50", border: "border-l-lime-500", text: "text-lime-900", badge: "bg-lime-100 text-lime-800 border-lime-300" },
  "Amtsgericht Ready": { bg: "bg-emerald-50", border: "border-l-emerald-600", text: "text-emerald-900", badge: "bg-emerald-200 text-emerald-900 border-emerald-400" },
  "RG/KV gesendet": { bg: "bg-purple-50", border: "border-l-purple-500", text: "text-purple-900", badge: "bg-purple-100 text-purple-800 border-purple-300" },
  "Bezahlt": { bg: "bg-green-50", border: "border-l-green-500", text: "text-green-900", badge: "bg-green-100 text-green-800 border-green-300" },
  "Exchanged": { bg: "bg-gray-50", border: "border-l-gray-500", text: "text-gray-900", badge: "bg-gray-100 text-gray-800 border-gray-300" },
  "Kein Interesse": { bg: "bg-red-50", border: "border-l-red-500", text: "text-red-900", badge: "bg-red-100 text-red-800 border-red-300" },
};

const NOTE_COLOR = { bg: "bg-indigo-50", border: "border-l-indigo-500", text: "text-indigo-900", badge: "bg-indigo-100 text-indigo-800 border-indigo-300" };

export const ActivityLogPanel = () => {
  const [expanded, setExpanded] = useState(true);
  const { data: entries = [], isLoading } = useInquiryActivityLog(50);

  return (
    <Card className="modern-card overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-5 py-3 hover:bg-muted/30 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-primary" />
          <span className="font-semibold text-sm">Aktivitätsprotokoll</span>
          <Badge variant="secondary" className="text-xs">{entries.length}</Badge>
        </div>
        {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>

      {expanded && (
        <CardContent className="p-0 border-t">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : entries.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-8">
              Noch keine Aktivitäten protokolliert.
            </p>
          ) : (
            <ScrollArea className="h-[280px]">
              <div className="divide-y">
                {entries.map((entry) => {
                  const isStatus = entry.activity_type === "status_change";
                  const colors = isStatus
                    ? STATUS_COLORS[entry.new_value || ""] || NOTE_COLOR
                    : NOTE_COLOR;
                  return (
                    <div
                      key={entry.id}
                      className={cn(
                        "px-4 py-2.5 border-l-4 flex items-center gap-3 text-sm",
                        colors.bg,
                        colors.border,
                        colors.text
                      )}
                    >
                      <div className="flex-shrink-0">
                        {isStatus ? (
                          <ArrowRight className="h-4 w-4" />
                        ) : (
                          <MessageSquarePlus className="h-4 w-4" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        {isStatus ? (
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="font-medium">{entry.inquiry_name || "Anfrage"}</span>
                            <span className="text-xs opacity-70">·</span>
                            <Badge variant="outline" className={cn("text-xs", STATUS_COLORS[entry.old_value || ""]?.badge)}>
                              {entry.old_value}
                            </Badge>
                            <ArrowRight className="h-3 w-3 opacity-60" />
                            <Badge variant="outline" className={cn("text-xs", colors.badge)}>
                              {entry.new_value}
                            </Badge>
                          </div>
                        ) : (
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="font-medium">{entry.inquiry_name || "Anfrage"}</span>
                            <Badge variant="outline" className={cn("text-xs", colors.badge)}>
                              {entry.old_value === "mailbox" ? "Mailbox" : "Notiz"}
                            </Badge>
                            <span className="text-xs opacity-80 truncate">"{entry.new_value}"</span>
                          </div>
                        )}
                      </div>
                      <div className="flex-shrink-0 text-right text-xs opacity-75">
                        <div>{format(new Date(entry.created_at), "dd.MM.yy HH:mm", { locale: de })}</div>
                        {entry.user_email && (
                          <div className="truncate max-w-[160px]">{entry.user_email}</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      )}
    </Card>
  );
};
