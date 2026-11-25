import type { Page, PageRequest } from "@/shared/domain/pagination";
import type { NewTransaction, Transaction, TransactionType } from "./transaction";

export type TransactionFilter = {
  from?: Date;
  to?: Date;
  type?: TransactionType;
  /** Id kategori, misalnya "cat_expense_transportasi". */
  categoryId?: string;
  /** Id akun. */
  accountId?: string;
  /** Kata pencarian di catatan dan kategori, tanpa membedakan huruf besar dan kecil. */
  q?: string;
};

/** Rentang waktu, kedua batasnya inklusif. */
export type DateRange = { from: Date; to: Date };

/** Hasil penjumlahan transaksi di satu periode, dihitung oleh backend (GET /summary). */
export type TransactionTotals = {
  totalIncome: number;
  totalExpense: number;
  /** totalIncome - totalExpense, bisa negatif. */
  netCashflow: number;
  transactionCount: number;
  incomeCount: number;
  expenseCount: number;
  /** Pengeluaran per kategori, urut dari nominal terbesar. */
  expenseByCategory: { categoryId: string; category: string; amount: number }[];
};

/**
 * Kontrak (port) penyimpanan transaksi.
 * Implementasinya ada di infrastructure: in-memory (mock) dan HTTP (backend API).
 * Use case hanya mengenal interface ini, jadi ganti sumber data tidak mengubah logika bisnis.
 * Tidak ada method yang mengembalikan semua transaksi sekaligus: daftar selalu per halaman,
 * dan angka total selalu lewat `summarize`.
 */
export interface TransactionRepository {
  /** Satu halaman transaksi, urut dari `occurredAt` terbaru. */
  list(filter: TransactionFilter, page: PageRequest): Promise<Page<Transaction>>;
  summarize(range: DateRange): Promise<TransactionTotals>;
  create(input: NewTransaction): Promise<Transaction>;
  /** null kalau transaksi tidak ada atau milik user lain. */
  findById(id: string): Promise<Transaction | null>;
  /** Mengganti isi transaksi dengan `input` (semua field dikirim). */
  update(id: string, input: NewTransaction): Promise<Transaction>;
  delete(id: string): Promise<void>;
  /** Menghapus semua `ids` sekaligus: berhasil semua atau tidak ada yang terhapus. Mengembalikan jumlahnya. */
  bulkDelete(ids: string[]): Promise<number>;
  /** Mengganti kategori dan/atau akun semua `ids` sekaligus, dengan aturan berhasil semua atau tidak sama sekali. */
  bulkUpdate(ids: string[], changes: BulkChanges): Promise<number>;
}

/** Perubahan untuk aksi massal "Ubah kategori" dan "Pindah akun" di tabel Transaksi. */
export type BulkChanges = { categoryId?: string; accountId?: string };
