import { useState } from "react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { CalendarIcon, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useUpdateUserVisibleFrom } from "@/hooks/useUsers";

interface UserVisibleFromPickerProps {
  userId: string;
  currentValue: string | null;
}

export const UserVisibleFromPicker = ({ userId, currentValue }: UserVisibleFromPickerProps) => {
  const [open, setOpen] = useState(false);
  const update = useUpdateUserVisibleFrom();

  const date = currentValue ? new Date(currentValue) : undefined;

  const handleSelect = (selected: Date | undefined) => {
    if (!selected) return;
    // Auf Mitternacht (lokal) normalisieren, damit "ab Datum" inklusiv funktioniert.
    const normalized = new Date(selected);
    normalized.setHours(0, 0, 0, 0);
    update.mutate(
      { userId, visibleFrom: normalized.toISOString() },
      { onSuccess: () => setOpen(false) }
    );
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    update.mutate({ userId, visibleFrom: null });
  };

  return (
    <div className="flex items-center gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            disabled={update.isPending}
            className={cn(
              "min-w-[170px] justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? format(date, "dd.MM.yyyy", { locale: de }) : <span>Alle sichtbar</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleSelect}
            initialFocus
            locale={de}
            className={cn("p-3 pointer-events-auto")}
          />
        </PopoverContent>
      </Popover>
      {date && (
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={handleClear}
          disabled={update.isPending}
          title="Zurücksetzen (alle Anfragen sichtbar)"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};
