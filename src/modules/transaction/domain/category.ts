import type { TransactionType } from "./transaction";

/**
 * Kategori transaksi dari tabel `categories` di backend (API-CONTRACT.md bagian 4.6).
 * Kategori bawaan dipakai semua user. Kategori kustom dibuat user lewat chip "+ Kategori baru"
 * di form Tambah transaksi dan hanya terlihat oleh pembuatnya.
 */
export type Category = {
  id: string;
  name: string;
  type: TransactionType;
  isDefault: boolean;
};

export type NewCategory = Pick<Category, "name" | "type">;

export const MAX_CATEGORY_NAME_LENGTH = 30;

/** Sama dengan isi migration 0004 di backend. Dipakai mode mock dan tebakan kategori Catat cepat. */
export const DEFAULT_CATEGORIES: readonly Omit<Category, "isDefault">[] = [
  { id: "cat_expense_makanan", name: "Makanan", type: "expense" },
  { id: "cat_expense_transportasi", name: "Transportasi", type: "expense" },
  { id: "cat_expense_belanja", name: "Belanja", type: "expense" },
  { id: "cat_expense_tagihan", name: "Tagihan", type: "expense" },
  { id: "cat_expense_hiburan", name: "Hiburan", type: "expense" },
  { id: "cat_expense_kesehatan", name: "Kesehatan", type: "expense" },
  { id: "cat_expense_pendidikan", name: "Pendidikan", type: "expense" },
  { id: "cat_expense_lainnya", name: "Lainnya", type: "expense" },
  { id: "cat_income_gaji", name: "Gaji", type: "income" },
  { id: "cat_income_freelance", name: "Freelance", type: "income" },
  { id: "cat_income_bonus", name: "Bonus", type: "income" },
  { id: "cat_income_hadiah", name: "Hadiah", type: "income" },
  { id: "cat_income_investasi", name: "Investasi", type: "income" },
  { id: "cat_income_lainnya", name: "Lainnya", type: "income" },
];

/** Id kategori bawaan dari namanya, misalnya ("expense", "Makanan") -> "cat_expense_makanan". Tidak dikenal -> Lainnya. */
export function defaultCategoryIdFor(type: TransactionType, name: string): string {
  const match = DEFAULT_CATEGORIES.find((category) => category.type === type && category.name.toLowerCase() === name.toLowerCase());
  return match?.id ?? `cat_${type}_lainnya`;
}
