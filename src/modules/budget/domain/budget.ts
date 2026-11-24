import type { Page, PageRequest } from "@/shared/domain/pagination";

/**
 * Batas belanja bulanan untuk satu kategori pengeluaran (API-CONTRACT.md bagian 4.10).
 * Berlaku setiap bulan sampai diubah.
 */
export type Budget = {
  categoryId: string;
  /** Nama kategori untuk ditampilkan. */
  category: string;
  /** Batas dalam Rupiah per bulan. */
  limit: number;
};

/** Port penyimpanan anggaran. Implementasinya HTTP (/budgets) dan in-memory (mock). */
export interface BudgetRepository {
  list(page: PageRequest): Promise<Page<Budget>>;
  /** Membuat atau mengganti batas satu kategori. */
  set(categoryId: string, limit: number): Promise<Budget>;
  delete(categoryId: string): Promise<void>;
}
