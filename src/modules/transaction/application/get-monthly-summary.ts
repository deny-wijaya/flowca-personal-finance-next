import type { TransactionRepository, TransactionTotals } from "../domain/transaction-repository";

export type MonthlySummary = TransactionTotals & {
  year: number;
  /** 1 = Januari, 12 = Desember */
  month: number;
};

/**
 * Ringkasan satu bulan untuk menu Dashboard dan Transaksi.
 * Penjumlahan dikerjakan backend (GET /summary), jadi frontend tidak perlu mengambil semua transaksi.
 */
export class GetMonthlySummary {
  constructor(private readonly repository: TransactionRepository) {}

  async execute({ year, month }: { year: number; month: number }): Promise<MonthlySummary> {
    // Batas bulan memakai zona waktu server Next, lalu dikirim ke backend lengkap dengan offset-nya.
    const from = new Date(year, month - 1, 1);
    const to = new Date(year, month, 0, 23, 59, 59, 999);
    const totals = await this.repository.summarize({ from, to });
    return { ...totals, year, month };
  }
}
