import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Mail } from "lucide-react";
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
      { inquiryId, noteText: newNote, noteType: 'note' },
      {
        onSuccess: () => {
          setNewNote("");
        },
      }
    );
  };

  const handleAddMailbox = () => {
    createNote.mutate(
      { inquiryId, noteText: "Mailbox-Eintrag", noteType: 'mailbox' }
    );
  };

  const regularNotes = notes?.filter(n => (n.note_type || 'note') === 'note') || [];
  const mailboxNotes = notes?.filter(n => n.note_type === 'mailbox') || [];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <div className="flex flex-wrap items-center gap-1 max-w-[240px]">
          {(regularNotes.length > 0 || mailboxNotes.length > 0) ? (
            <>
              {regularNotes.map((note, index) => (
                <Button
                  key={note.id}
                  variant="outline"
                  size="sm"
                  className={`h-6 text-[10px] px-2 ${getUserColor(note.user_email)}`}
                >
                  Notiz {regularNotes.length - index}
                </Button>
              ))}
              {mailboxNotes.map((note, index) => (
                <Button
                  key={note.id}
                  variant="outline"
                  size="sm"
                  className="h-6 text-[10px] px-2 bg-amber-100 text-amber-800 border-amber-300 hover:bg-amber-200"
                >
                  MB {mailboxNotes.length - index}
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
            <div className="flex gap-2">
              <Button 
                onClick={handleAddNote} 
                disabled={!newNote.trim() || createNote.isPending}
                size="sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                Notiz hinzufügen
              </Button>
              <Button 
                onClick={handleAddMailbox} 
                disabled={createNote.isPending}
                size="sm"
                variant="outline"
                className="bg-amber-100 text-amber-800 border-amber-300 hover:bg-amber-200"
              >
                <Mail className="h-4 w-4 mr-2" />
                Mailbox
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Vorhandene Notizen</label>
            <ScrollArea className="h-[300px] rounded-md border p-4">
              {isLoading ? (
                <p className="text-sm text-muted-foreground">Lade Notizen...</p>
              ) : notes && notes.length > 0 ? (
                <div className="space-y-4">
                  {notes.map((note) => {
                    const isMailbox = note.note_type === 'mailbox';
                    const sameTypeNotes = notes.filter(n => (n.note_type || 'note') === (note.note_type || 'note'));
                    const typeIndex = sameTypeNotes.length - sameTypeNotes.indexOf(note);
                    return (
                    <div key={note.id} className="border-b pb-3 last:border-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-medium border ${isMailbox ? 'bg-amber-100 text-amber-800 border-amber-300' : getUserColor(note.user_email)}`}>
                            {isMailbox ? `MB ${typeIndex}` : `Notiz ${typeIndex}`}
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
                    );
                  })}
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
