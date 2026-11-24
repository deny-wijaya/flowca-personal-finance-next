import type { TransactionRepository } from "@/modules/transaction/domain/transaction-repository";
import type { Budget, BudgetRepository } from "../domain/budget";

export type BudgetUsage = {
  categoryId: string;
  category: string;
  limit: number;
  spent: number;
  /** spent / limit; bisa lebih dari 1 bila lewat batas. */
  ratio: number;
};

export type BudgetOverview = {
  year: number;
  month: number;
  items: BudgetUsage[];
  totalLimit: number;
  totalSpent: number;
  /** totalLimit − totalSpent, bisa negatif. */
  remaining: number;
  /** Jumlah hari tersisa sampai akhir bulan, tidak termasuk hari ini. 0 untuk bulan lampau. */
  daysLeft: number;
};

export class GetBudgetOverview {
  constructor(
    private readonly budgets: BudgetRepository,
    private readonly transactions: TransactionRepository,
    private readonly now: () => Date = () => new Date(),
  ) {}

  async execute({ year, month }: { year: number; month: number }): Promise<BudgetOverview> {
    const from = new Date(year, month - 1, 1);
    const to = new Date(year, month, 0, 23, 59, 59, 999);
    // Pengeluaran per kategori dijumlahkan oleh backend (GET /summary), bukan dari daftar transaksi.
    const [budgets, totals] = await Promise.all([this.listAll(), this.transactions.summarize({ from, to })]);

    // Batas dari GET /budgets digabung dengan pengeluaran per kategori dari GET /summary lewat categoryId.
    const spentByCategory = new Map(totals.expenseByCategory.map((item) => [item.categoryId, item.amount]));

    const items = budgets.map((budget) => {
      const spent = spentByCategory.get(budget.categoryId) ?? 0;
      return { categoryId: budget.categoryId, category: budget.category, limit: budget.limit, spent, ratio: budget.limit > 0 ? spent / budget.limit : 0 };
    });
    const totalLimit = items.reduce((sum, item) => sum + item.limit, 0);
    const totalSpent = items.reduce((sum, item) => sum + item.spent, 0);

    return { year, month, items, totalLimit, totalSpent, remaining: totalLimit - totalSpent, daysLeft: daysLeftInMonth(year, month, this.now()) };
  }
  /** Semua anggaran user, mengikuti next_cursor sampai habis. */
  private async listAll(): Promise<Budget[]> {
    const all: Budget[] = [];
    let cursor: string | undefined;
    do {
      const page = await this.budgets.list({ limit: BUDGET_PAGE_LIMIT, cursor });
      all.push(...page.items);
      cursor = page.nextCursor ?? undefined;
    } while (cursor);
    return all;
  }

}

/** Batas per halaman saat mengambil anggaran. Satu user paling banyak punya satu anggaran per kategori. */
const BUDGET_PAGE_LIMIT = 100;

function daysLeftInMonth(year: number, month: number, now: Date) {
  const lastDay = new Date(year, month, 0).getDate();
  if (now.getFullYear() !== year || now.getMonth() + 1 !== month) {
    return new Date(year, month - 1, 1) > now ? lastDay : 0;
  }
  return lastDay - now.getDate();
}
