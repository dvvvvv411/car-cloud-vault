import { useQuery } from "@tanstack/react-query";

interface Transaction {
  id: string;
  name: string;
  company_name: string | null;
  amount: number;
  created_at: string;
}

interface TransactionCategory {
  anzahl: number;
  summe: number;
  transaktionen: Transaction[];
}

interface BankAccount {
  id: string;
  kontoinhaber: string;
  iban: string;
  bic: string;
  bank_name: string;
  geschlecht: "M" | "W";
  bd_steller: string | null;
  ist_eigenes_konto: boolean;
  umsaetze: {
    uebermittelt: TransactionCategory;
    bezahlt: TransactionCategory;
    exchanged: TransactionCategory;
    caller_bezahlt: TransactionCategory;
  };
  gesamtumsatz: number;
}

export const useBankAccounts = () => {
  return useQuery({
    queryKey: ["bank-accounts"],
    queryFn: async () => {
      const response = await fetch(
        "https://bguvzruhukgdxxoqpata.supabase.co/functions/v1/get-available-bank-accounts"
      );
      
      if (!response.ok) {
        throw new Error("Fehler beim Laden der Bankkonten");
      }
      
      const data = await response.json();
      return data.bank_accounts as BankAccount[];
    },
  });
};
