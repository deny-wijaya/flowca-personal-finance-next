import type { NewTransaction, Transaction, TransactionType } from "./transaction";

export type TransactionFilter = {
  from?: Date;
  to?: Date;
  type?: TransactionType;
};

/**
 * Kontrak (port) penyimpanan transaksi.
 * Implementasinya ada di infrastructure: in-memory (mock) dan HTTP (backend API).
 * Use case hanya mengenal interface ini, jadi ganti sumber data tidak mengubah logika bisnis.
 */
export interface TransactionRepository {
  list(filter?: TransactionFilter): Promise<Transaction[]>;
  create(input: NewTransaction): Promise<Transaction>;
}
