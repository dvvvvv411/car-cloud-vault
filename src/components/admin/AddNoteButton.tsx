import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { useCreateInquiryNote } from "@/hooks/useInquiryNotes";

interface AddNoteButtonProps {
  inquiryId: string;
}

export const AddNoteButton = ({ inquiryId }: AddNoteButtonProps) => {
  const [open, setOpen] = useState(false);
  const [noteText, setNoteText] = useState("");
  const createNote = useCreateInquiryNote();

  const handleAddNote = () => {
    if (noteText.trim()) {
      createNote.mutate(
        { inquiryId, noteText: noteText.trim() },
        {
          onSuccess: () => {
            setNoteText("");
            setOpen(false);
          },
        }
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-6 w-6 p-0">
          <Plus className="h-3 w-3" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Notiz hinzufügen</DialogTitle>
        </DialogHeader>
        <Textarea
          placeholder="Notiz eingeben..."
          value={noteText}
          onChange={(e) => setNoteText(e.target.value)}
          className="min-h-[100px]"
        />
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Abbrechen
          </Button>
          <Button 
            onClick={handleAddNote} 
            disabled={!noteText.trim() || createNote.isPending}
          >
            {createNote.isPending ? "Wird gespeichert..." : "Speichern"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};