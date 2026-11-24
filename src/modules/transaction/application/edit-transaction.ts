import { assertValidNewTransaction, type NewTransaction, type Transaction } from "../domain/transaction";
import type { BulkChanges, TransactionRepository } from "../domain/transaction-repository";

/** Satu transaksi untuk diisi ke sheet "Ubah transaksi" (/transactions/edit?id=...). */
export class GetTransaction {
  constructor(private readonly repository: TransactionRepository) {}

  /** null kalau transaksi tidak ada atau milik user lain (backend membalas 404 untuk keduanya). */
  execute(id: string): Promise<Transaction | null> {
    return this.repository.findById(id);
  }
}

/** Menyimpan perubahan dari sheet "Ubah transaksi" (PATCH /transactions/:id). Aturannya sama dengan transaksi baru. */
export class UpdateTransaction {
  constructor(
    private readonly repository: TransactionRepository,
    private readonly now: () => Date = () => new Date(),
  ) {}

  async execute(id: string, input: NewTransaction): Promise<Transaction> {
    const normalized: NewTransaction = { ...input, note: input.note?.trim() || undefined };
    assertValidNewTransaction(normalized, this.now());
    return this.repository.update(id, normalized);
  }
}

/** Menghapus transaksi dari tombol "Hapus transaksi" di sheet ubah, setelah dikonfirmasi user. */
export class DeleteTransaction {
  constructor(private readonly repository: TransactionRepository) {}

  execute(id: string): Promise<void> {
    return this.repository.delete(id);
  }
}

/** Aksi massal di tabel Transaksi desktop: Hapus, Ubah kategori, dan Pindah akun untuk transaksi yang dicentang. */
export class BulkEditTransactions {
  constructor(private readonly repository: TransactionRepository) {}

  delete(ids: string[]): Promise<number> {
    return this.repository.bulkDelete(ids);
  }

  update(ids: string[], changes: BulkChanges): Promise<number> {
    return this.repository.bulkUpdate(ids, changes);
  }
}
