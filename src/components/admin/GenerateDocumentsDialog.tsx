import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileText, Loader2, Download } from "lucide-react";
import { Inquiry } from "@/hooks/useInquiries";
import { useBankAccounts } from "@/hooks/useBankAccounts";
import { useGenerateDocuments } from "@/hooks/useGenerateDocuments";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
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

  const { data: bankAccounts, isLoading: loadingBankAccounts } = useBankAccounts();
  const generateMutation = useGenerateDocuments();

  const handleGenerate = async () => {
    const selectedAccount = bankAccounts?.find((acc) => acc.id === selectedBankAccount);
    if (!selectedAccount || !inquiry.brandings) return;

    setStep(2);

    try {
      // Adresse splitten (vereinfachte Logik - kann verbessert werden)
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
  };

  const handleDownloadAll = () => {
    if (!generatedDocs) return;

    const companyName = inquiry.company_name || `${inquiry.first_name}_${inquiry.last_name}`;
    const sanitizedCompanyName = companyName.replace(/[^a-zA-Z0-9]/g, '_');
    
    const documents = [
      { name: `Rechnung_${sanitizedCompanyName}.${fileFormat}`, base64: generatedDocs.documents.rechnung.base64 },
      { name: `Kaufvertrag_${sanitizedCompanyName}.${fileFormat}`, base64: generatedDocs.documents.kaufvertrag.base64 },
      { name: `Treuhandvertrag_${sanitizedCompanyName}.${fileFormat}`, base64: generatedDocs.documents.treuhandvertrag.base64 },
    ];

    documents.forEach((doc, index) => {
      setTimeout(() => {
        // Base64 zu Blob konvertieren
        const byteCharacters = atob(doc.base64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        
        const mimeType = fileFormat === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        const blob = new Blob([byteArray], { type: mimeType });
        
        // Download triggern
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = doc.name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, index * 500); // 500ms Verzögerung zwischen Downloads
    });

    toast.success(`${documents.length} Dokumente werden heruntergeladen...`);
  };

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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {step === 1 && "Bankkonto & Format auswählen"}
            {step === 2 && "Dokumente werden generiert..."}
            {step === 3 && "Dokumente-Preview"}
          </DialogTitle>
        </DialogHeader>

        {/* SCHRITT 1: Bankkonto & Format wählen */}
        {step === 1 && (
          <div className="space-y-6">
            {/* Dateityp-Auswahl */}
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

            {/* Bankkonto-Auswahl */}
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
                        <div className="flex gap-2 mt-3 flex-wrap">
                          <Badge variant="outline" className="text-xs">
                            Übermittelt: {account.umsaetze.uebermittelt.anzahl} ({account.umsaetze.uebermittelt.summe.toFixed(2)} €)
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            Bezahlt: {account.umsaetze.bezahlt.anzahl} ({account.umsaetze.bezahlt.summe.toFixed(2)} €)
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            Gesamt: {account.gesamtumsatz.toFixed(2)} €
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Abbrechen
              </Button>
              <Button
                onClick={handleGenerate}
                disabled={!selectedBankAccount || generateMutation.isPending}
              >
                Dokumente generieren
              </Button>
            </div>
          </div>
        )}

        {/* SCHRITT 2: Generierung läuft */}
        {step === 2 && (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-lg font-medium">Dokumente werden generiert...</p>
            <p className="text-sm text-muted-foreground">Dies kann einen Moment dauern</p>
          </div>
        )}

        {/* SCHRITT 3: Preview */}
        {step === 3 && generatedDocs && (
          <div className="space-y-4">
            <ScrollArea className="h-[500px]">
              <div className="space-y-4">
                {/* Rechnung */}
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-2">Rechnung</h3>
                  <iframe
                    src={generatedDocs.storagePaths[0].url}
                    className="w-full h-[400px] border rounded"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => window.open(generatedDocs.storagePaths[0].url, "_blank")}
                  >
                    In neuem Tab öffnen
                  </Button>
                </div>

                {/* Kaufvertrag */}
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-2">Kaufvertrag</h3>
                  <iframe
                    src={generatedDocs.storagePaths[1].url}
                    className="w-full h-[400px] border rounded"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => window.open(generatedDocs.storagePaths[1].url, "_blank")}
                  >
                    In neuem Tab öffnen
                  </Button>
                </div>

                {/* Treuhandvertrag */}
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-2">Treuhandvertrag</h3>
                  <iframe
                    src={generatedDocs.storagePaths[2].url}
                    className="w-full h-[400px] border rounded"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => window.open(generatedDocs.storagePaths[2].url, "_blank")}
                  >
                    In neuem Tab öffnen
                  </Button>
                </div>
              </div>
            </ScrollArea>

            <div className="flex justify-between items-center">
              <Button 
                variant="default" 
                onClick={handleDownloadAll}
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                Alle Dokumente runterladen
              </Button>
              
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleReset}>
                  Neue Dokumente generieren
                </Button>
                <Button onClick={() => setOpen(false)}>
                  Fertig
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
