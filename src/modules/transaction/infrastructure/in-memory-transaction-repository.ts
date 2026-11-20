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

/**
 * Contoh data bulan berjalan (sama dengan data di file desain Flowca), supaya
 * dashboard langsung terisi saat mode mock. Tanggal di atas hari ini dipotong ke hari ini.
 */
export function createSeedTransactions(now: Date = new Date()): Transaction[] {
  const at = (day: number, hour: number, minute: number) => {
    const date = new Date(now.getFullYear(), now.getMonth(), Math.min(day, now.getDate()), hour, minute);
    return date.getTime() > now.getTime() ? new Date(now.getTime() - 60_000) : date;
  };
  const rows: NewTransaction[] = [
    { type: "income", amount: 6_500_000, category: "Gaji", note: "Gaji November", accountId: "bank", occurredAt: at(1, 9, 0) },
    { type: "expense", amount: 432_500, category: "Belanja", note: "Belanja bulanan", accountId: "bank", occurredAt: at(14, 10, 15) },
    { type: "income", amount: 1_200_000, category: "Freelance", note: "Proyek desain logo", accountId: "bank", occurredAt: at(15, 16, 0) },
    { type: "expense", amount: 18_000, category: "Transportasi", note: "Ojek ke kantor", accountId: "bank", occurredAt: at(18, 7, 45) },
    { type: "expense", amount: 150_000, category: "Tagihan", note: "Token listrik", accountId: "bank", occurredAt: at(18, 19, 20) },
    { type: "expense", amount: 22_000, category: "Makanan", note: "Kopi susu", accountId: "bank", occurredAt: at(19, 8, 10) },
    { type: "expense", amount: 25_000, category: "Makanan", note: "Makan siang", accountId: "cash", occurredAt: at(19, 12, 30) },
  ];
  return rows.map((row, index) => ({ ...row, id: `seed-${index + 1}` }));
}
