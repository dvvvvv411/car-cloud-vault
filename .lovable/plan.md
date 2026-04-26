## Ziel
Auf der Seite `/admin/anfragen` in der Spalte **Aktion** den Button **"Dokumente erstellen"** (`GenerateDocumentsDialog`) entfernen — sowohl in der Desktop-Tabelle als auch in der Mobile-Karten-Ansicht.

## Änderungen

### `src/pages/admin/AdminAnfragen.tsx`
- Desktop (Zeilen ~603-608): Den Block
  ```tsx
  <>
    <GenerateDocumentsDialog inquiry={inquiry} />
    <TransferButton inquiryId={inquiry.id} />
  </>
  ```
  reduzieren auf nur `<TransferButton inquiryId={inquiry.id} />`.
- Mobile (Zeilen ~744-749): Analog `<GenerateDocumentsDialog ... />` entfernen, `<TransferButton ... />` bleibt.
- Den `import { GenerateDocumentsDialog }` aus Zeile 17 entfernen, da er nicht mehr verwendet wird.

Die Datei `src/components/admin/GenerateDocumentsDialog.tsx` selbst bleibt unverändert (kein anderer Aufrufer).
