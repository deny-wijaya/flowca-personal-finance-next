import type { Page, PageRequest } from "@/shared/domain/pagination";
import { ValidationError } from "@/shared/domain/errors";
import { defaultCategoryIdFor } from "../domain/category";
import type { NewTransaction, Transaction } from "../domain/transaction";
import { InMemoryCategoryRepository } from "./in-memory-category-repository";
import type { BulkChanges, DateRange, TransactionFilter, TransactionRepository, TransactionTotals } from "../domain/transaction-repository";

/**
 * Implementasi repository tanpa backend (dipakai saat DATA_SOURCE=mock dan di unit test).
 * Data hanya disimpan di memori proses server, jadi hilang saat server restart.
 * Perilakunya meniru backend: daftar per halaman (terbaru di atas) dan ringkasan yang dihitung di sini.
 */
export class InMemoryTransactionRepository implements TransactionRepository {
  private transactions: Transaction[];

  constructor(
    seed: Transaction[] = [],
    private readonly categories: InMemoryCategoryRepository = new InMemoryCategoryRepository(),
  ) {
    this.transactions = [...seed];
  }

  async list(filter: TransactionFilter, page: PageRequest): Promise<Page<Transaction>> {
    const rows = this.matching(filter).sort((a, b) => b.occurredAt.getTime() - a.occurredAt.getTime() || (a.id < b.id ? 1 : -1));
    // Di mock, cursor cukup berisi posisi (offset) item berikutnya. Frontend tetap memperlakukannya sebagai teks.
    const start = page.cursor ? Number(page.cursor) : 0;
    const end = start + page.limit;
    return { items: rows.slice(start, end), nextCursor: end < rows.length ? String(end) : null };
  }

  async summarize(range: DateRange): Promise<TransactionTotals> {
    const rows = this.matching(range);
    const expenseMap = new Map<string, { categoryId: string; category: string; amount: number }>();
    let totalIncome = 0;
    let totalExpense = 0;
    let incomeCount = 0;
    for (const trx of rows) {
      if (trx.type === "income") {
        totalIncome += trx.amount;
        incomeCount += 1;
      } else {
        totalExpense += trx.amount;
        const item = expenseMap.get(trx.categoryId) ?? { categoryId: trx.categoryId, category: trx.category, amount: 0 };
        item.amount += trx.amount;
        expenseMap.set(trx.categoryId, item);
      }
    }
    const expenseByCategory = [...expenseMap.values()].sort((a, b) => b.amount - a.amount || a.category.localeCompare(b.category));
    return {
      totalIncome,
      totalExpense,
      netCashflow: totalIncome - totalExpense,
      transactionCount: rows.length,
      incomeCount,
      expenseCount: rows.length - incomeCount,
      expenseByCategory,
    };
  }

  /** Selisih pemasukan − pengeluaran per id akun, untuk saldo di InMemoryAccountRepository (mode mock). */
  async netByAccount(): Promise<ReadonlyMap<string, number>> {
    const delta = new Map<string, number>();
    for (const trx of this.transactions) {
      if (!trx.accountId) continue;
      const signed = trx.type === "income" ? trx.amount : -trx.amount;
      delta.set(trx.accountId, (delta.get(trx.accountId) ?? 0) + signed);
    }
    return delta;
  }

  async findById(id: string): Promise<Transaction | null> {
    return this.transactions.find((trx) => trx.id === id) ?? null;
  }

  async update(id: string, input: NewTransaction): Promise<Transaction> {
    const index = this.transactions.findIndex((trx) => trx.id === id);
    const category = this.categories.find(input.categoryId);
    if (index < 0 || !category) throw new ValidationError("Transaksi atau kategori tidak ditemukan", "categoryId");
    const updated: Transaction = { ...input, category: category.name, id };
    this.transactions[index] = updated;
    return updated;
  }

  async bulkDelete(ids: string[]): Promise<number> {
    const unique = new Set(ids);
    if (this.transactions.filter((trx) => unique.has(trx.id)).length !== unique.size) {
      throw new ValidationError("Sebagian transaksi tidak ditemukan. Tidak ada yang diubah.", "form");
    }
    this.transactions = this.transactions.filter((trx) => !unique.has(trx.id));
    return unique.size;
  }

  async bulkUpdate(ids: string[], changes: BulkChanges): Promise<number> {
    const unique = new Set(ids);
    const targets = this.transactions.filter((trx) => unique.has(trx.id));
    if (targets.length !== unique.size) throw new ValidationError("Sebagian transaksi tidak ditemukan. Tidak ada yang diubah.", "form");
    const category = changes.categoryId ? this.categories.find(changes.categoryId) : undefined;
    if (changes.categoryId && (!category || targets.some((trx) => trx.type !== category.type))) {
      throw new ValidationError("Kategori tidak cocok dengan jenis transaksi yang dipilih.", "form");
    }
    this.transactions = this.transactions.map((trx) =>
      unique.has(trx.id) ? { ...trx, ...changes, category: category?.name ?? trx.category } : trx,
    );
    return unique.size;
  }

  async delete(id: string): Promise<void> {
    this.transactions = this.transactions.filter((trx) => trx.id !== id);
  }

  async create(input: NewTransaction): Promise<Transaction> {
    // Meniru validasi backend: kategori harus ada dan jenisnya cocok.
    const category = this.categories.find(input.categoryId);
    if (!category) throw new ValidationError("Kategori tidak ditemukan", "categoryId");
    if (category.type !== input.type) {
      throw new ValidationError(`Kategori ${category.name} tidak bisa dipakai untuk ${input.type === "income" ? "pemasukan" : "pengeluaran"}`, "categoryId");
    }
    const transaction: Transaction = { ...input, category: category.name, id: crypto.randomUUID() };
    this.transactions.push(transaction);
    return transaction;
  }

  private matching(filter: TransactionFilter): Transaction[] {
    const q = filter.q?.trim().toLowerCase();
    return this.transactions.filter((trx) => {
      const time = trx.occurredAt.getTime();
      if (filter.from && time < filter.from.getTime()) return false;
      if (filter.to && time > filter.to.getTime()) return false;
      if (filter.type && trx.type !== filter.type) return false;
      if (filter.categoryId && trx.categoryId !== filter.categoryId) return false;
      if (filter.accountId && trx.accountId !== filter.accountId) return false;
      if (q && !`${trx.note ?? ""} ${trx.category}`.toLowerCase().includes(q)) return false;
      return true;
    });
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
  const rows: Omit<Transaction, "id" | "categoryId">[] = [
    { type: "income", amount: 6_500_000, category: "Gaji", note: "Gaji November", accountId: "bank", occurredAt: at(1, 9, 0) },
    { type: "expense", amount: 432_500, category: "Belanja", note: "Belanja bulanan", accountId: "bank", occurredAt: at(14, 10, 15) },
    { type: "income", amount: 1_200_000, category: "Freelance", note: "Proyek desain logo", accountId: "bank", occurredAt: at(15, 16, 0) },
    { type: "expense", amount: 18_000, category: "Transportasi", note: "Ojek ke kantor", accountId: "bank", occurredAt: at(18, 7, 45) },
    { type: "expense", amount: 150_000, category: "Tagihan", note: "Token listrik", accountId: "bank", occurredAt: at(18, 19, 20) },
    { type: "expense", amount: 22_000, category: "Makanan", note: "Kopi susu", accountId: "bank", occurredAt: at(19, 8, 10) },
    { type: "expense", amount: 25_000, category: "Makanan", note: "Makan siang", accountId: "cash", occurredAt: at(19, 12, 30) },
  ];
  return rows.map((row, index) => ({ ...row, categoryId: defaultCategoryIdFor(row.type, row.category), id: `seed-${index + 1}` }));
}
