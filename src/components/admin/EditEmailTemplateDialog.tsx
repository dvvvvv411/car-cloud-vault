import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useUpdateEmailTemplate } from "@/hooks/useEmailTemplates";

const formSchema = z.object({
  subject: z.string().min(1, "Betreff ist erforderlich"),
  body: z.string().min(10, "Email-Text muss mindestens 10 Zeichen lang sein"),
});

interface EditEmailTemplateDialogProps {
  template: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditEmailTemplateDialog({
  template,
  open,
  onOpenChange,
}: EditEmailTemplateDialogProps) {
  const updateTemplate = useUpdateEmailTemplate();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      subject: "",
      body: "",
    },
  });

  useEffect(() => {
    if (template) {
      form.reset({
        subject: template.subject,
        body: template.body,
      });
    }
  }, [template, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    await updateTemplate.mutateAsync({
      id: template.id,
      subject: values.subject,
      body: values.body,
    });
    onOpenChange(false);
  };

  const getTemplateLabel = (type: string) => {
    const labels: Record<string, string> = {
      'single_male': 'Herr - 1 Fahrzeug',
      'single_female': 'Frau - 1 Fahrzeug',
      'multiple_male': 'Herr - Mehrere Fahrzeuge',
      'multiple_female': 'Frau - Mehrere Fahrzeuge'
    };
    return labels[type] || type;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Email Template bearbeiten: {template && getTemplateLabel(template.template_type)}
          </DialogTitle>
          <DialogDescription>
            Verfügbare Variablen: %NACHNAME%, %ANWALT_NAME%, %AKTENZEICHEN%
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Betreff</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Übersendung der Vertragsunterlagen..." />
                  </FormControl>
                  <FormDescription>
                    Verwende %AKTENZEICHEN% für die automatische Aktenzeichen-Einfügung
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="body"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email-Text (Plain Text)</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      rows={20}
                      placeholder="Sehr geehrter Herr %NACHNAME%,..."
                      className="font-mono text-sm"
                    />
                  </FormControl>
                  <FormDescription>
                    Variablen: %NACHNAME% (Kundenname), %ANWALT_NAME% (Rechtsanwalt Name)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Abbrechen
              </Button>
              <Button type="submit" disabled={updateTemplate.isPending}>
                {updateTemplate.isPending ? "Speichert..." : "Speichern"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
