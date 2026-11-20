import type { Budget, BudgetRepository } from "../domain/budget";

/** Anggaran contoh untuk mode mock; dipakai untuk setiap bulan. Backend belum punya endpoint anggaran. */
export class InMemoryBudgetRepository implements BudgetRepository {
  constructor(private readonly budgets: Budget[] = createSeedBudgets()) {}

  async listForMonth(): Promise<Budget[]> {
    return [...this.budgets];
  }
}

export function createSeedBudgets(): Budget[] {
  return [
    { category: "Makanan", limit: 1_500_000 },
    { category: "Transportasi", limit: 600_000 },
    { category: "Tagihan", limit: 180_000 },
    { category: "Belanja", limit: 400_000 },
    { category: "Hiburan", limit: 300_000 },
  ];
}
