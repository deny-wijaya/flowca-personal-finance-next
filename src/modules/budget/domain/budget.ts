/** Batas belanja bulanan untuk satu kategori pengeluaran. */
export type Budget = {
  category: string;
  /** Batas dalam Rupiah per bulan. */
  limit: number;
};

/** Port penyimpanan anggaran. */
export interface BudgetRepository {
  listForMonth(year: number, month: number): Promise<Budget[]>;
}
