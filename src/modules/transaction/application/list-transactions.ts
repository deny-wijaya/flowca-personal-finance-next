import type { Transaction } from "../domain/transaction";
import type { TransactionFilter, TransactionRepository } from "../domain/transaction-repository";

export class ListTransactions {
  constructor(private readonly repository: TransactionRepository) {}

  /** Mengembalikan transaksi terbaru di urutan paling atas. */
  async execute(filter?: TransactionFilter): Promise<Transaction[]> {
    const transactions = await this.repository.list(filter);
    return [...transactions].sort((a, b) => b.occurredAt.getTime() - a.occurredAt.getTime());
  }
}
