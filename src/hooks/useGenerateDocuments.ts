import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface GenerateDocumentsParams {
  format: "pdf" | "docx";
  kunde: {
    unternehmensname: string;
    ansprechpartner: string;
    adresse: string;
    hausnummer: string;
    plz: string;
    stadt: string;
  };
  bankkonto: {
    iban: string;
    bic: string;
    kontoinhaber: string;
    bankname: string;
    kontoinhaber_geschlecht: "M" | "W";
  };
  insolventes_unternehmen_name: string;
  kanzlei_name: string;
  dekra_nummern: string[];
  rabatt_prozent: number;
  rabatt_aktiv: boolean;
}

interface GeneratedDocument {
  base64: string;
  filename: string;
}

interface GeneratedDocuments {
  rechnung: GeneratedDocument;
  kaufvertrag: GeneratedDocument;
  treuhandvertrag: GeneratedDocument;
  rechnungsnummer?: string;
}

interface UploadedDocument {
  path: string;
  url: string;
}

// Umlaute und Sonderzeichen für Dateipfade bereinigen
function sanitizeForStorage(text: string): string {
  return text
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/Ä/g, 'Ae')
    .replace(/Ö/g, 'Oe')
    .replace(/Ü/g, 'Ue')
    .replace(/ß/g, 'ss')
    .replace(/[^a-zA-Z0-9_-]/g, '_') // Alle anderen Sonderzeichen durch _ ersetzen
    .replace(/_+/g, '_') // Mehrfache _ durch ein einziges ersetzen
    .replace(/^_+|_+$/g, ''); // _ am Anfang/Ende entfernen
}

async function uploadDocument(
  doc: GeneratedDocument,
  customerName: string
): Promise<UploadedDocument> {
  // Base64 zu Blob konvertieren
  const byteCharacters = atob(doc.base64);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  const blob = new Blob([byteArray], { type: "application/pdf" });

  // In Supabase Storage hochladen
  const sanitizedCustomerName = sanitizeForStorage(customerName);
  const sanitizedFilename = sanitizeForStorage(doc.filename);
  const path = `${sanitizedCustomerName}/${Date.now()}_${sanitizedFilename}`;
  const { data, error } = await supabase.storage
    .from("inquiry-documents")
    .upload(path, blob, {
      contentType: "application/pdf",
      upsert: false,
    });

  if (error) throw error;

  // Public URL zurückgeben
  const { data: urlData } = supabase.storage
    .from("inquiry-documents")
    .getPublicUrl(path);

  return { path, url: urlData.publicUrl };
}

export const useGenerateDocuments = () => {
  return useMutation({
    mutationFn: async (params: GenerateDocumentsParams) => {
      // 1. PDFs generieren
      const response = await fetch(
        "https://rjjkbnglizodcsjtqicq.supabase.co/functions/v1/generate-insolvenzpanel-documents",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(params),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("PDF-Generierung fehlgeschlagen:", errorText);
        throw new Error(`Fehler bei der PDF-Generierung: ${errorText}`);
      }

      const documents: GeneratedDocuments = await response.json();

      // 2. PDFs in Supabase Storage speichern
      const uploadedDocs = await Promise.all([
        uploadDocument(documents.rechnung, params.kunde.unternehmensname),
        uploadDocument(documents.kaufvertrag, params.kunde.unternehmensname),
        uploadDocument(documents.treuhandvertrag, params.kunde.unternehmensname),
      ]);

      return {
        documents,
        storagePaths: uploadedDocs,
      };
    },
  });
};
