import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileText, Loader2, Download, Mail } from "lucide-react";
import { Inquiry } from "@/hooks/useInquiries";
import { useBankAccounts } from "@/hooks/useBankAccounts";
import { useGenerateDocuments } from "@/hooks/useGenerateDocuments";
import { useSendDocumentsEmail } from "@/hooks/useSendDocumentsEmail";
import { useEmailTemplates, useSelectEmailTemplate } from "@/hooks/useEmailTemplates";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

interface Props {
  inquiry: Inquiry;
}

export function GenerateDocumentsDialog({ inquiry }: Props) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedBankAccount, setSelectedBankAccount] = useState<string | null>(null);
  const [fileFormat, setFileFormat] = useState<"pdf" | "docx">("pdf");
  const [generatedDocs, setGeneratedDocs] = useState<any>(null);
  const [emailPreview, setEmailPreview] = useState<{ subject: string; body: string } | null>(null);

  const { data: bankAccounts, isLoading: loadingBankAccounts } = useBankAccounts();
  const { data: emailTemplates } = useEmailTemplates();
  const generateMutation = useGenerateDocuments();
  const sendEmailMutation = useSendDocumentsEmail();

  const vehicleCount = inquiry.selected_vehicles?.length || 0;
  const selectedTemplate = useSelectEmailTemplate(emailTemplates, vehicleCount, inquiry.salutation);

  // Email Preview generieren wenn Dokumente erstellt wurden
  useEffect(() => {
    if (step === 3 && selectedTemplate && inquiry.brandings) {
      let subject = selectedTemplate.subject
        .replace(/%NACHNAME%/g, inquiry.last_name)
        .replace(/%ANWALT_NAME%/g, inquiry.brandings.lawyer_name)
        .replace(/%AKTENZEICHEN%/g, inquiry.brandings.case_number);

      let body = selectedTemplate.body
        .replace(/%NACHNAME%/g, inquiry.last_name)
        .replace(/%ANWALT_NAME%/g, inquiry.brandings.lawyer_name)
        .replace(/%AKTENZEICHEN%/g, inquiry.brandings.case_number);

      // Signatur anhängen
      if (inquiry.brandings.admin_email_signature) {
        body += `\n\n${inquiry.brandings.admin_email_signature}`;
      }

      setEmailPreview({ subject, body });
    }
  }, [step, selectedTemplate, inquiry]);

  const handleGenerate = async () => {
    const selectedAccount = bankAccounts?.find((acc) => acc.id === selectedBankAccount);
    if (!selectedAccount || !inquiry.brandings) return;

    setStep(2);

    try {
      const addressParts = inquiry.street.split(" ");
      const hausnummer = addressParts.pop() || "";
      const adresse = addressParts.join(" ");

      const result = await generateMutation.mutateAsync({
        format: fileFormat,
        kunde: {
          unternehmensname: inquiry.company_name || `${inquiry.first_name} ${inquiry.last_name}`,
          ansprechpartner: `${inquiry.first_name} ${inquiry.last_name}`,
          adresse,
          hausnummer,
          plz: inquiry.zip_code,
          stadt: inquiry.city,
        },
        bankkonto: {
          iban: selectedAccount.iban,
          bic: selectedAccount.bic,
          kontoinhaber: selectedAccount.kontoinhaber,
          bankname: selectedAccount.bank_name,
          kontoinhaber_geschlecht: "M",
        },
        insolventes_unternehmen_name: inquiry.brandings.company_name,
        kanzlei_name: inquiry.brandings.lawyer_firm_name,
        dekra_nummern: inquiry.selected_vehicles.map((v) => v.report_nr),
        rabatt_prozent: inquiry.discount_percentage || 0,
        rabatt_aktiv: !!inquiry.discount_percentage,
      });

      setGeneratedDocs(result);
      setStep(3);
      toast.success("Dokumente erfolgreich generiert!");
    } catch (error) {
      toast.error("Fehler bei der Dokumenten-Generierung");
      setStep(1);
    }
  };

  const handleReset = () => {
    setStep(1);
    setSelectedBankAccount(null);
    setGeneratedDocs(null);
    setEmailPreview(null);
  };

  const handleDownloadAll = () => {
    if (!generatedDocs) return;

    const companyName = inquiry.company_name || `${inquiry.first_name}_${inquiry.last_name}`;
    const sanitizedCompanyName = companyName.replace(/[^a-zA-Z0-9]/g, '_');
    
    const documents = [
      { name: generatedDocs.documents.rechnung.filename, base64: generatedDocs.documents.rechnung.base64 },
      { name: generatedDocs.documents.kaufvertrag.filename, base64: generatedDocs.documents.kaufvertrag.base64 },
      { name: generatedDocs.documents.treuhandvertrag.filename, base64: generatedDocs.documents.treuhandvertrag.base64 },
    ];

    documents.forEach((doc, index) => {
      setTimeout(() => {
        const byteCharacters = atob(doc.base64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        
        const mimeType = fileFormat === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        const blob = new Blob([byteArray], { type: mimeType });
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = doc.name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, index * 500);
    });

    toast.success(`${documents.length} Dokumente werden heruntergeladen...`);
  };

  const handleSendEmail = async () => {
    if (!generatedDocs || !inquiry.branding_id) {
      toast.error("Fehlende Daten für Email-Versand");
      return;
    }

    if (!inquiry.brandings?.resend_api_key || !inquiry.brandings?.resend_sender_email) {
      toast.error("Resend API nicht konfiguriert für dieses Branding");
      return;
    }

    const companyName = inquiry.company_name || `${inquiry.first_name}_${inquiry.last_name}`;
    const sanitizedCompanyName = companyName.replace(/[^a-zA-Z0-9]/g, '_');

      await sendEmailMutation.mutateAsync({
        inquiryId: inquiry.id,
        brandingId: inquiry.branding_id,
        documents: {
          rechnung: {
            base64: generatedDocs.documents.rechnung.base64,
            filename: generatedDocs.documents.rechnung.filename,
          },
          kaufvertrag: {
            base64: generatedDocs.documents.kaufvertrag.base64,
            filename: generatedDocs.documents.kaufvertrag.filename,
          },
          treuhandvertrag: {
            base64: generatedDocs.documents.treuhandvertrag.base64,
            filename: generatedDocs.documents.treuhandvertrag.filename,
          },
        },
      });

    setOpen(false);
    handleReset();
  };

  const canSendEmail = inquiry.brandings?.resend_api_key && inquiry.brandings?.resend_sender_email;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      setOpen(isOpen);
      if (!isOpen) handleReset();
    }}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <FileText className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className={step === 3 ? "max-w-7xl" : "max-w-4xl"} style={{ maxHeight: "90vh" }}>
        <DialogHeader>
          <DialogTitle>
            {step === 1 && "Bankkonto & Format auswählen"}
            {step === 2 && "Dokumente werden generiert..."}
            {step === 3 && "Dokumente-Preview & Email-Versand"}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-100px)]">
          {/* SCHRITT 1: Bankkonto & Format wählen */}
          {step === 1 && (
            <div className="space-y-6 pr-4">
              <div>
                <Label className="text-base font-semibold mb-3 block">Dateityp</Label>
                <RadioGroup value={fileFormat} onValueChange={(val) => setFileFormat(val as "pdf" | "docx")}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="pdf" id="pdf" />
                    <Label htmlFor="pdf" className="cursor-pointer">PDF</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="docx" id="docx" />
                    <Label htmlFor="docx" className="cursor-pointer">DOCX</Label>
                  </div>
                </RadioGroup>
              </div>

              <div>
                <Label className="text-base font-semibold mb-3 block">Bankkonto auswählen</Label>
                {loadingBankAccounts ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : (
                  <ScrollArea className="h-[400px] pr-4">
                    <div className="space-y-3">
                      {bankAccounts?.map((account) => (
                        <div
                          key={account.id}
                          onClick={() => setSelectedBankAccount(account.id)}
                          className={`p-4 border rounded-lg cursor-pointer transition-all ${
                            selectedBankAccount === account.id
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/50"
                          }`}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <p className="font-semibold">{account.kontoinhaber}</p>
                              <p className="text-sm text-muted-foreground">{account.bank_name}</p>
                            </div>
                            {account.ist_eigenes_konto && (
                              <Badge variant="secondary">Eigenes Konto</Badge>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground space-y-1">
                            <p>IBAN: {account.iban}</p>
                            <p>BIC: {account.bic}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  onClick={handleGenerate}
                  disabled={!selectedBankAccount || generateMutation.isPending}
                >
                  {generateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Dokumente generieren
                </Button>
              </div>
            </div>
          )}

          {/* SCHRITT 2: Lade-Indikator */}
          {step === 2 && (
            <div className="flex flex-col items-center justify-center py-16 space-y-4">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="text-muted-foreground">Dokumente werden generiert...</p>
            </div>
          )}

          {/* SCHRITT 3: PDFs nebeneinander + Email Preview */}
          {step === 3 && generatedDocs && (
            <div className="space-y-6 pr-4">
              {/* PDFs Grid */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Generierte Dokumente</h3>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  {/* Rechnung */}
                  <Card className="min-w-0">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Rechnung</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="aspect-video bg-muted rounded-md overflow-hidden">
                        {fileFormat === 'pdf' && (
                          <iframe
                            src={`data:application/pdf;base64,${generatedDocs.documents.rechnung.base64}`}
                            className="w-full h-full"
                            title="Rechnung Preview"
                          />
                        )}
                        {fileFormat === 'docx' && (
                          <div className="flex items-center justify-center h-full">
                            <FileText className="h-16 w-16 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Kaufvertrag */}
                  <Card className="min-w-0">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Kaufvertrag</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="aspect-video bg-muted rounded-md overflow-hidden">
                        {fileFormat === 'pdf' && (
                          <iframe
                            src={`data:application/pdf;base64,${generatedDocs.documents.kaufvertrag.base64}`}
                            className="w-full h-full"
                            title="Kaufvertrag Preview"
                          />
                        )}
                        {fileFormat === 'docx' && (
                          <div className="flex items-center justify-center h-full">
                            <FileText className="h-16 w-16 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Treuhandvertrag */}
                  <Card className="min-w-0">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Treuhandvertrag</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="aspect-video bg-muted rounded-md overflow-hidden">
                        {fileFormat === 'pdf' && (
                          <iframe
                            src={`data:application/pdf;base64,${generatedDocs.documents.treuhandvertrag.base64}`}
                            className="w-full h-full"
                            title="Treuhandvertrag Preview"
                          />
                        )}
                        {fileFormat === 'docx' && (
                          <div className="flex items-center justify-center h-full">
                            <FileText className="h-16 w-16 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Button onClick={handleDownloadAll} variant="outline" className="w-full">
                  <Download className="mr-2 h-4 w-4" />
                  Alle Dokumente herunterladen
                </Button>
              </div>

              {/* Email Preview */}
              {emailPreview && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Email Vorschau</h3>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm text-muted-foreground">An: {inquiry.email}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label className="text-xs text-muted-foreground">Betreff</Label>
                        <p className="font-semibold">{emailPreview.subject}</p>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Nachricht</Label>
                        <ScrollArea className="h-[200px] mt-2 p-4 bg-muted rounded-md">
                          <div className="whitespace-pre-wrap text-sm">
                            {emailPreview.body.split('\n\n' + inquiry.brandings?.admin_email_signature)[0]}
                          </div>
                          
                          {inquiry.brandings?.admin_email_signature && (
                            <>
                              <Separator className="my-4" />
                              <div className="whitespace-pre-wrap text-sm text-muted-foreground">
                                {inquiry.brandings.admin_email_signature}
                              </div>
                            </>
                          )}
                        </ScrollArea>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        <p className="font-semibold mb-1">Anhänge:</p>
                        <ul className="list-disc list-inside space-y-1">
                          <li>{generatedDocs.documents.rechnung.filename}</li>
                          <li>{generatedDocs.documents.kaufvertrag.filename}</li>
                          <li>{generatedDocs.documents.treuhandvertrag.filename}</li>
                        </ul>
                      </div>
                    </CardContent>
                  </Card>

                  {!canSendEmail && (
                    <p className="text-sm text-destructive mt-2">
                      Resend API ist nicht konfiguriert für dieses Branding. Email-Versand nicht möglich.
                    </p>
                  )}

                  <div className="flex gap-2 mt-4">
                    <Button 
                      onClick={handleSendEmail} 
                      disabled={!canSendEmail || sendEmailMutation.isPending}
                      className="flex-1"
                    >
                      {sendEmailMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Wird gesendet...
                        </>
                      ) : (
                        <>
                          <Mail className="mr-2 h-4 w-4" />
                          Email mit Dokumenten versenden
                        </>
                      )}
                    </Button>
                    <Button onClick={handleReset} variant="outline">
                      Neu generieren
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
