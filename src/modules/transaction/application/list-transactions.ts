import { DEFAULT_PAGE_LIMIT, type Page, type PageRequest } from "@/shared/domain/pagination";
import type { Transaction } from "../domain/transaction";
import type { TransactionFilter, TransactionRepository } from "../domain/transaction-repository";

export class ListTransactions {
  constructor(private readonly repository: TransactionRepository) {}

  /** Satu halaman transaksi, terbaru di atas. Urutan dijamin oleh repository (backend). */
  execute(filter: TransactionFilter = {}, page: PageRequest = { limit: DEFAULT_PAGE_LIMIT }): Promise<Page<Transaction>> {
    return this.repository.list(filter, page);
  }
}
