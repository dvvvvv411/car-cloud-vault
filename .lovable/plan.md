

## Neuer Admin-Reiter "Amtsgericht"

### Was wird gemacht

Ein neuer Navigationspunkt "Amtsgericht" wird im Admin-Panel unterhalb von "Anfragen" hinzugefuegt. Diese Seite zeigt nur Anfragen mit dem Status "Amtsgericht" an. Der Nutzer kann dort:
- Alle Informationen einsehen (read-only)
- Den Status nur auf "Moechte RG/KV" oder "Kein Interesse" aendern
- Notizen hinzufuegen (wie gewohnt)

Alles andere (Fahrzeuge editieren, DEKRA kopieren, Kundeninfos bearbeiten, Rabatt) ist gesperrt.

### Technische Umsetzung

#### 1. Neue Seite: `src/pages/admin/AdminAmtsgericht.tsx`

Eine neue Seite, die den gleichen `useInquiries` Hook nutzt, aber:
- Nur Anfragen mit `status === "Amtsgericht"` anzeigt
- Eine eingeschraenkte Version der Tabelle rendert
- Statt `InquiryStatusDropdown` ein eigenes Dropdown mit nur 3 Optionen: "Amtsgericht", "Moechte RG/KV", "Kein Interesse"
- Kein Call-Priority Checkbox, kein Transfer-Button, kein GenerateDocuments
- Statt `InquiryDetailsDialog` eine read-only Version (ohne Edit-Buttons)

#### 2. Read-Only Details Dialog

`InquiryDetailsDialog` bekommt eine optionale Prop `readOnly?: boolean`. Wenn `readOnly={true}`:
- `EditCustomerInfoDialog` wird ausgeblendet
- `EditInquiryVehiclesDialog` wird ausgeblendet
- `DekraNumbersDialog` (Kopier-Button) wird ausgeblendet
- `DiscountButton` wird ausgeblendet
- Status-Dropdown wird auf die 3 erlaubten Status beschraenkt
- Notizen bleiben voll funktionsfaehig (hinzufuegen + ansehen)

#### 3. Eingeschraenktes Status-Dropdown

`InquiryStatusDropdown` bekommt eine optionale Prop `allowedStatuses?: InquiryStatus[]`. Wenn gesetzt, werden nur diese Status-Optionen im Dropdown angezeigt.

#### 4. Routing: `src/App.tsx`

Neue Route: `/admin/amtsgericht` -> `AdminAmtsgericht`

#### 5. Navigation: `src/pages/admin/AdminLayout.tsx`

Neuer Navigationspunkt "Amtsgericht" mit einem passenden Icon (z.B. `Landmark` von lucide), direkt unter "Anfragen".

### Dateien die geaendert/erstellt werden

| Datei | Aenderung |
|-------|-----------|
| `src/pages/admin/AdminAmtsgericht.tsx` | **Neu** - Amtsgericht-Seite mit gefilterter Anfragenliste |
| `src/components/admin/InquiryDetailsDialog.tsx` | `readOnly` Prop hinzufuegen, bedingt Edit-Buttons ausblenden |
| `src/components/admin/InquiryStatusDropdown.tsx` | `allowedStatuses` Prop hinzufuegen |
| `src/pages/admin/AdminLayout.tsx` | Neuer Nav-Eintrag "Amtsgericht" |
| `src/App.tsx` | Neue Route `/admin/amtsgericht` |

### Keine Datenbank-Aenderungen noetig

Die Statusaenderung nutzt den bestehenden `useUpdateInquiryStatus` Hook und den bereits vorhandenen "Amtsgericht" Enum-Wert. Aenderungen auf der Amtsgericht-Seite sind sofort auch unter /admin/anfragen sichtbar, da beide den gleichen `inquiries` Query-Key verwenden.

