import { ValidationError } from "@/shared/domain/errors";
import type { Budget, BudgetRepository } from "../domain/budget";

const MAX_BUDGET = 1_000_000_000_000;

/** Membuat atau mengubah anggaran satu kategori dari menu Anggaran. */
export class SetBudget {
  constructor(private readonly budgets: BudgetRepository) {}

  async execute(categoryId: string, limit: number): Promise<Budget> {
    // Dicek juga di backend. Di sini supaya pesan muncul tanpa menunggu request.
    if (!Number.isInteger(limit) || limit <= 0) throw new ValidationError("Nominal anggaran harus bilangan bulat lebih dari 0", "amount");
    if (limit > MAX_BUDGET) throw new ValidationError("Nominal anggaran melebihi batas Rp 1.000.000.000.000", "amount");
    return this.budgets.set(categoryId, limit);
  }
}

/** Menghapus anggaran satu kategori dari menu Anggaran. */
export class DeleteBudget {
  constructor(private readonly budgets: BudgetRepository) {}

  execute(categoryId: string): Promise<void> {
    return this.budgets.delete(categoryId);
  }
}
