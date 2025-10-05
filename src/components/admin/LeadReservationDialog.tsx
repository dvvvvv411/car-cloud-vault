import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, X } from "lucide-react";
import { Lead } from "@/hooks/useLeads";
import { useLeadReservations, useAddReservations, useRemoveReservation } from "@/hooks/useLeadReservations";
import { format } from "date-fns";
import { de } from "date-fns/locale";

interface LeadReservationDialogProps {
  lead: Lead | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const LeadReservationDialog = ({ lead, open, onOpenChange }: LeadReservationDialogProps) => {
  const [chassisInput, setChassisInput] = useState("");
  
  const { data: reservations, isLoading } = useLeadReservations(lead?.id || null);
  const addMutation = useAddReservations();
  const removeMutation = useRemoveReservation();

  const handleAdd = () => {
    if (!lead || !chassisInput.trim()) return;
    
    const chassisNumbers = chassisInput
      .split("\n")
      .map(line => line.trim())
      .filter(line => line.length > 0);
    
    if (chassisNumbers.length === 0) return;
    
    addMutation.mutate(
      { leadId: lead.id, chassisNumbers },
      {
        onSuccess: () => {
          setChassisInput("");
        },
      }
    );
  };

  const handleRemove = (reservationId: string) => {
    removeMutation.mutate({ reservationId });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Reservierungen für {lead?.email}</DialogTitle>
          <DialogDescription>
            Verwalten Sie die reservierten Fahrzeuge für diesen Lead
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Neue Reservierungen hinzufügen */}
          <div className="space-y-2">
            <Label htmlFor="chassis-input">Neue Reservierungen hinzufügen</Label>
            <Textarea
              id="chassis-input"
              placeholder="DEKRA-Nummern eingeben (eine pro Zeile)&#10;Beispiel:&#10;WBA123&#10;WBA456"
              value={chassisInput}
              onChange={(e) => setChassisInput(e.target.value)}
              rows={5}
              disabled={addMutation.isPending}
            />
            <Button 
              onClick={handleAdd} 
              disabled={!chassisInput.trim() || addMutation.isPending}
              className="w-full"
            >
              {addMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Wird hinzugefügt...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Hinzufügen
                </>
              )}
            </Button>
          </div>

          {/* Aktuelle Reservierungen */}
          <div className="space-y-2">
            <Label>Aktuelle Reservierungen ({reservations?.length || 0})</Label>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : reservations && reservations.length > 0 ? (
              <div className="space-y-2 max-h-60 overflow-y-auto border rounded-lg p-2">
                {reservations.map((reservation) => (
                  <div
                    key={reservation.id}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-md hover:bg-muted transition-colors"
                  >
                    <div className="flex-1">
                      <div className="font-mono font-semibold">{reservation.vehicle_chassis}</div>
                      <div className="text-xs text-muted-foreground">
                        Reserviert am {format(new Date(reservation.reserved_at), "dd.MM.yyyy HH:mm", { locale: de })}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemove(reservation.id)}
                      disabled={removeMutation.isPending}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground border rounded-lg">
                Noch keine Reservierungen
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
