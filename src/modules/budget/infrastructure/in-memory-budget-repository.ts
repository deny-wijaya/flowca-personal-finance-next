import type { Page, PageRequest } from "@/shared/domain/pagination";
import type { Budget, BudgetRepository } from "../domain/budget";

/** Anggaran tanpa backend (DATA_SOURCE=mock dan unit test). */
export class InMemoryBudgetRepository implements BudgetRepository {
  private budgets: Budget[];

  constructor(seed: Budget[] = createSeedBudgets()) {
    this.budgets = [...seed];
  }

  async list(page: PageRequest): Promise<Page<Budget>> {
    const start = page.cursor ? Number(page.cursor) : 0;
    const end = start + page.limit;
    return { items: this.budgets.slice(start, end), nextCursor: end < this.budgets.length ? String(end) : null };
  }

  async set(categoryId: string, limit: number): Promise<Budget> {
    const existing = this.budgets.find((budget) => budget.categoryId === categoryId);
    if (existing) {
      existing.limit = limit;
      return { ...existing };
    }
    const budget = { categoryId, category: categoryId, limit };
    this.budgets.push(budget);
    return budget;
  }

  async delete(categoryId: string): Promise<void> {
    this.budgets = this.budgets.filter((budget) => budget.categoryId !== categoryId);
  }
}

/** Anggaran contoh untuk mode mock. */
export function createSeedBudgets(): Budget[] {
  return [
    { categoryId: "cat_expense_makanan", category: "Makanan", limit: 1_500_000 },
    { categoryId: "cat_expense_transportasi", category: "Transportasi", limit: 600_000 },
    { categoryId: "cat_expense_tagihan", category: "Tagihan", limit: 180_000 },
    { categoryId: "cat_expense_belanja", category: "Belanja", limit: 400_000 },
    { categoryId: "cat_expense_hiburan", category: "Hiburan", limit: 300_000 },
  ];
}
