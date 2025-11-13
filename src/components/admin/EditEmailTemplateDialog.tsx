import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useUpdateEmailTemplate, EmailTemplate } from "@/hooks/useEmailTemplates";
import { Loader2 } from "lucide-react";

interface EditEmailTemplateDialogProps {
  template: EmailTemplate;
  children: React.ReactNode;
}

export const EditEmailTemplateDialog = ({ template, children }: EditEmailTemplateDialogProps) => {
  const [open, setOpen] = useState(false);
  const [subject, setSubject] = useState(template.subject);
  const [body, setBody] = useState(template.body);
  const updateMutation = useUpdateEmailTemplate();

  const handleSave = async () => {
    await updateMutation.mutateAsync({
      id: template.id,
      subject,
      body,
    });
    setOpen(false);
  };

  const handleCancel = () => {
    setSubject(template.subject);
    setBody(template.body);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Email-Template bearbeiten</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="subject">Betreff</Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Übersendung der Vertragsunterlagen und Rechnung (AZ %AKTENZEICHEN%)"
            />
            <p className="text-xs text-muted-foreground">
              Verwenden Sie %AKTENZEICHEN% als Variable für das Aktenzeichen
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="body">Email-Text</Label>
            <Textarea
              id="body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="min-h-[400px] font-mono text-sm"
              placeholder="Sehr geehrter Herr %NACHNAME%,..."
            />
            <p className="text-xs text-muted-foreground">
              Verfügbare Variablen: %AKTENZEICHEN%, %NACHNAME%, %ANWALT_NAME%
            </p>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={updateMutation.isPending}
            >
              Abbrechen
            </Button>
            <Button
              type="button"
              onClick={handleSave}
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Speichern
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
