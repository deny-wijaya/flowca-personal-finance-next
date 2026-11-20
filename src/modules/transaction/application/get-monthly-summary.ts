import type { TransactionRepository } from "../domain/transaction-repository";

export type MonthlySummary = {
  year: number;
  /** 1 = Januari, 12 = Desember */
  month: number;
  totalIncome: number;
  totalExpense: number;
  /** totalIncome - totalExpense, bisa negatif */
  netCashflow: number;
  /** Pengeluaran per kategori, diurutkan dari yang terbesar */
  expenseByCategory: { category: string; amount: number }[];
};

export class GetMonthlySummary {
  constructor(private readonly repository: TransactionRepository) {}

  async execute({ year, month }: { year: number; month: number }): Promise<MonthlySummary> {
    const from = new Date(year, month - 1, 1);
    const to = new Date(year, month, 0, 23, 59, 59, 999);
    const transactions = await this.repository.list({ from, to });

    let totalIncome = 0;
    let totalExpense = 0;
    const expenseMap = new Map<string, number>();

    for (const trx of transactions) {
      if (trx.type === "income") {
        totalIncome += trx.amount;
      } else {
        totalExpense += trx.amount;
        expenseMap.set(trx.category, (expenseMap.get(trx.category) ?? 0) + trx.amount);
      }
    }

    const expenseByCategory = [...expenseMap.entries()]
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount);

    return {
      year,
      month,
      totalIncome,
      totalExpense,
      netCashflow: totalIncome - totalExpense,
      expenseByCategory,
    };
  }
}
