import { ValidationError } from "@/shared/domain/errors";

/**
 * Entity Transaction. Layer domain tidak boleh import Next.js, React,
 * zod, atau apa pun dari infrastructure. Isinya hanya aturan bisnis.
 */
export const TRANSACTION_TYPES = ["income", "expense"] as const;
export type TransactionType = (typeof TRANSACTION_TYPES)[number];

export const TRANSACTION_CATEGORIES = {
  income: ["Gaji", "Freelance", "Bonus", "Hadiah", "Investasi", "Lainnya"],
  expense: ["Makanan", "Transportasi", "Belanja", "Tagihan", "Hiburan", "Kesehatan", "Pendidikan", "Lainnya"],
} as const satisfies Record<TransactionType, readonly string[]>;

export type TransactionCategory = (typeof TRANSACTION_CATEGORIES)[TransactionType][number];

export type Transaction = {
  id: string;
  type: TransactionType;
  /** Nominal dalam Rupiah, bilangan bulat positif (tanpa desimal). */
  amount: number;
  category: string;
  /** Deskripsi singkat, mis. "Makan siang". Bila kosong, UI memakai nama kategori. */
  note?: string;
  /** Akun sumber/tujuan uang (lihat modul account). Opsional untuk data lama dari API. */
  accountId?: string;
  occurredAt: Date;
};

export type NewTransaction = Omit<Transaction, "id">;

export const MAX_TRANSACTION_AMOUNT = 1_000_000_000_000;

/** Aturan bisnis untuk transaksi baru. Melempar ValidationError bila tidak valid. */
export function assertValidNewTransaction(input: NewTransaction, now: Date = new Date()): void {
  if (!Number.isInteger(input.amount) || input.amount <= 0) {
    throw new ValidationError("Nominal harus bilangan bulat lebih dari 0", "amount");
  }
  if (input.amount > MAX_TRANSACTION_AMOUNT) {
    throw new ValidationError("Nominal melebihi batas maksimal", "amount");
  }
  const allowedCategories: readonly string[] = TRANSACTION_CATEGORIES[input.type];
  if (!allowedCategories.includes(input.category)) {
    throw new ValidationError(`Kategori "${input.category}" tidak valid untuk ${input.type}`, "category");
  }
  if (input.occurredAt.getTime() > now.getTime()) {
    throw new ValidationError("Tanggal transaksi tidak boleh di masa depan", "occurredAt");
  }
}
