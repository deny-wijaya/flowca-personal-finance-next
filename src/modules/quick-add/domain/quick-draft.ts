import type { TransactionType } from "@/modules/transaction/domain/transaction";

/** Hasil tebakan AI/parser dari satu kalimat. Selalu perlu konfirmasi pengguna sebelum disimpan. */
export type QuickDraft = {
  name: string;
  category: string;
  accountId: string;
  type: TransactionType;
  amount: number;
  day: "today" | "yesterday";
};

export type ReceiptReading = {
  draft: QuickDraft;
  /** Ringkasan item yang terbaca dari nota. */
  note: string;
};

/** Port: mengubah kalimat bebas ("kopi 22rb pakai bank") menjadi draf transaksi. */
export interface QuickEntryParser {
  parse(text: string): Promise<QuickDraft[]>;
}

/** Port: membaca foto nota menjadi satu draf pengeluaran. */
export interface ReceiptReader {
  read(): Promise<ReceiptReading>;
}
