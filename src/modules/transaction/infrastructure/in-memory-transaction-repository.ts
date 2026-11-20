import type { NewTransaction, Transaction } from "../domain/transaction";
import type { TransactionFilter, TransactionRepository } from "../domain/transaction-repository";

/**
 * Implementasi repository tanpa backend (dipakai saat DATA_SOURCE=mock dan di unit test).
 * Data hanya disimpan di memori proses server, jadi hilang saat server restart.
 */
export class InMemoryTransactionRepository implements TransactionRepository {
  private transactions: Transaction[];

  constructor(seed: Transaction[] = []) {
    this.transactions = [...seed];
  }

  async list(filter: TransactionFilter = {}): Promise<Transaction[]> {
    return this.transactions.filter((trx) => {
      const time = trx.occurredAt.getTime();
      if (filter.from && time < filter.from.getTime()) return false;
      if (filter.to && time > filter.to.getTime()) return false;
      if (filter.type && trx.type !== filter.type) return false;
      return true;
    });
  }

  async create(input: NewTransaction): Promise<Transaction> {
    const transaction: Transaction = { ...input, id: crypto.randomUUID() };
    this.transactions.push(transaction);
    return transaction;
  }
}

/** Contoh data bulan berjalan, supaya dashboard langsung terisi saat mode mock. */
export function createSeedTransactions(now: Date = new Date()): Transaction[] {
  const day = (d: number) => new Date(now.getFullYear(), now.getMonth(), Math.min(d, now.getDate()), 9);
  const rows: Omit<Transaction, "id">[] = [
    { type: "income", amount: 12_500_000, category: "Gaji", note: "Gaji bulanan", occurredAt: day(1) },
    { type: "expense", amount: 1_850_000, category: "Tagihan", note: "Cicilan kos", occurredAt: day(2) },
    { type: "expense", amount: 450_000, category: "Tagihan", note: "Token listrik PLN", occurredAt: day(3) },
    { type: "expense", amount: 186_000, category: "Hiburan", note: "Netflix + Spotify", occurredAt: day(5) },
    { type: "expense", amount: 85_000, category: "Makan & Minum", note: "Makan siang tim", occurredAt: day(6) },
    { type: "expense", amount: 64_000, category: "Transportasi", note: "Gojek ke kantor", occurredAt: day(6) },
    { type: "income", amount: 2_000_000, category: "Freelance", note: "Landing page klien", occurredAt: day(8) },
    { type: "expense", amount: 742_500, category: "Belanja", note: "Belanja bulanan Superindo", occurredAt: day(9) },
  ];
  return rows.map((row, index) => ({ ...row, id: `seed-${index + 1}` }));
}
