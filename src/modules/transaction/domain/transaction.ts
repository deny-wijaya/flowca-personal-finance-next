import { ValidationError } from "@/shared/domain/errors";

/**
 * Entity Transaction. Layer domain tidak boleh import Next.js, React,
 * zod, atau apa pun dari infrastructure. Isinya hanya aturan bisnis.
 */
export const TRANSACTION_TYPES = ["income", "expense"] as const;
export type TransactionType = (typeof TRANSACTION_TYPES)[number];

export type Transaction = {
  id: string;
  type: TransactionType;
  /** Nominal dalam Rupiah, bilangan bulat positif (tanpa desimal). */
  amount: number;
  /** Id kategori, misalnya "cat_expense_makanan". */
  categoryId: string;
  /** Nama kategori untuk ditampilkan, dikirim backend bersama transaksi. */
  category: string;
  /** Deskripsi singkat, mis. "Makan siang". Bila kosong, UI memakai nama kategori. */
  note?: string;
  /** Akun sumber/tujuan uang (lihat modul account). Opsional untuk data lama dari API. */
  accountId?: string;
  occurredAt: Date;
};

/** Data transaksi baru. Nama kategori tidak ikut, karena backend mengambilnya dari `categoryId`. */
export type NewTransaction = Omit<Transaction, "id" | "category">;

export const MAX_TRANSACTION_AMOUNT = 1_000_000_000_000;

/** Aturan bisnis untuk transaksi baru. Melempar ValidationError bila tidak valid. */
export function assertValidNewTransaction(input: NewTransaction, now: Date = new Date()): void {
  if (!Number.isInteger(input.amount) || input.amount <= 0) {
    throw new ValidationError("Nominal harus bilangan bulat lebih dari 0", "amount");
  }
  if (input.amount > MAX_TRANSACTION_AMOUNT) {
    throw new ValidationError("Nominal melebihi batas maksimal", "amount");
  }
  if (input.occurredAt.getTime() > now.getTime()) {
    throw new ValidationError("Tanggal transaksi tidak boleh di masa depan", "occurredAt");
  }
}
