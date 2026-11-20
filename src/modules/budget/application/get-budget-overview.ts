import type { TransactionRepository } from "@/modules/transaction/domain/transaction-repository";
import type { BudgetRepository } from "../domain/budget";

export type BudgetUsage = {
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
    const [budgets, expenses] = await Promise.all([
      this.budgets.listForMonth(year, month),
      this.transactions.list({ from, to, type: "expense" }),
    ]);

    const spentByCategory = new Map<string, number>();
    for (const trx of expenses) spentByCategory.set(trx.category, (spentByCategory.get(trx.category) ?? 0) + trx.amount);

    const items = budgets.map((budget) => {
      const spent = spentByCategory.get(budget.category) ?? 0;
      return { category: budget.category, limit: budget.limit, spent, ratio: budget.limit > 0 ? spent / budget.limit : 0 };
    });
    const totalLimit = items.reduce((sum, item) => sum + item.limit, 0);
    const totalSpent = items.reduce((sum, item) => sum + item.spent, 0);

    return { year, month, items, totalLimit, totalSpent, remaining: totalLimit - totalSpent, daysLeft: daysLeftInMonth(year, month, this.now()) };
  }
}

function daysLeftInMonth(year: number, month: number, now: Date) {
  const lastDay = new Date(year, month, 0).getDate();
  if (now.getFullYear() !== year || now.getMonth() + 1 !== month) {
    return new Date(year, month - 1, 1) > now ? lastDay : 0;
  }
  return lastDay - now.getDate();
}
