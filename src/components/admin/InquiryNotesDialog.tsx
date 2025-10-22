import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus } from "lucide-react";
import { useInquiryNotes, useCreateInquiryNote } from "@/hooks/useInquiryNotes";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { getUserColor } from "@/lib/utils";

interface InquiryNotesDialogProps {
  inquiryId: string;
}

export const InquiryNotesDialog = ({ inquiryId }: InquiryNotesDialogProps) => {
  const [open, setOpen] = useState(false);
  const [newNote, setNewNote] = useState("");
  const { data: notes, isLoading } = useInquiryNotes(inquiryId);
  const createNote = useCreateInquiryNote();

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    
    createNote.mutate(
      { inquiryId, noteText: newNote },
      {
        onSuccess: () => {
          setNewNote("");
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <div className="flex flex-wrap items-center gap-1 max-w-[240px]">
          {notes && notes.length > 0 ? (
            <>
              {notes.map((note, index) => (
                <Button
                  key={note.id}
                  variant="outline"
                  size="sm"
                  className={`h-6 text-[10px] px-2 ${getUserColor(note.user_email)}`}
                >
                  Notiz {notes.length - index}
                </Button>
              ))}
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <Plus className="h-3 w-3" />
              </Button>
            </>
          ) : (
            <Button variant="ghost" size="sm" className="h-6 text-[10px] px-2">
              <Plus className="h-3 w-3 mr-1" />
              Notiz
            </Button>
          )}
        </div>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Notizen</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Neue Notiz hinzufügen</label>
            <Textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Notiz eingeben..."
              rows={3}
            />
            <Button 
              onClick={handleAddNote} 
              disabled={!newNote.trim() || createNote.isPending}
              size="sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              Notiz hinzufügen
            </Button>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Vorhandene Notizen</label>
            <ScrollArea className="h-[300px] rounded-md border p-4">
              {isLoading ? (
                <p className="text-sm text-muted-foreground">Lade Notizen...</p>
              ) : notes && notes.length > 0 ? (
                <div className="space-y-4">
                  {notes.map((note, index) => (
                    <div key={note.id} className="border-b pb-3 last:border-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-medium border ${getUserColor(note.user_email)}`}>
                            Notiz {notes.length - index}
                          </span>
                          {note.user_email && (
                            <span className="text-xs text-muted-foreground">
                              {note.user_email}
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(note.created_at), "dd.MM.yyyy HH:mm", { locale: de })}
                        </span>
                      </div>
                      <p className="text-sm whitespace-pre-wrap">{note.note_text}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Noch keine Notizen vorhanden.</p>
              )}
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
