import { describe, expect, it } from "vitest";
import { ValidationError } from "@/shared/domain/errors";
import type { Transaction } from "../domain/transaction";
import { InMemoryTransactionRepository } from "../infrastructure/in-memory-transaction-repository";
import { CreateTransaction } from "./create-transaction";
import { GetMonthlySummary } from "./get-monthly-summary";
import { ListTransactions } from "./list-transactions";
import { CreateCategory } from "./create-category";
import { ListCategories } from "./list-categories";
import { defaultCategoryIdFor } from "../domain/category";
import { InMemoryCategoryRepository } from "../infrastructure/in-memory-category-repository";

const NOW = new Date(2026, 10, 13, 12); // 13 Nov 2026

function trx(partial: Partial<Transaction> & Pick<Transaction, "id">): Transaction {
  const base = { type: "expense" as const, amount: 50_000, category: "Makanan", occurredAt: new Date(2026, 10, 10), ...partial };
  return { ...base, categoryId: partial.categoryId ?? defaultCategoryIdFor(base.type, base.category) };
}

describe("CreateTransaction", () => {
  it("menyimpan transaksi valid dan merapikan catatan kosong", async () => {
    const repo = new InMemoryTransactionRepository();
    const useCase = new CreateTransaction(repo, () => NOW);

    const created = await useCase.execute({
      type: "expense",
      amount: 85_000,
      categoryId: "cat_expense_makanan",
      note: "   ",
      occurredAt: new Date(2026, 10, 12),
    });

    expect(created.id).toBeTruthy();
    expect(created.note).toBeUndefined();
    expect(created.category).toBe("Makanan");
    expect((await repo.list({}, { limit: 20 })).items).toHaveLength(1);
  });

  it.each([
    ["nominal 0", { amount: 0 }, "amount"],
    ["nominal desimal", { amount: 1500.5 }, "amount"],
    ["kategori pemasukan dipakai untuk pengeluaran", { categoryId: "cat_income_gaji" }, "categoryId"],
    ["kategori yang tidak ada", { categoryId: "cat_tidak_ada" }, "categoryId"],
    ["tanggal di masa depan", { occurredAt: new Date(2026, 10, 20) }, "occurredAt"],
  ])("menolak %s", async (_label, override, field) => {
    const repo = new InMemoryTransactionRepository();
    const useCase = new CreateTransaction(repo, () => NOW);

    const promise = useCase.execute({
      type: "expense",
      amount: 85_000,
      categoryId: "cat_expense_makanan",
      occurredAt: new Date(2026, 10, 12),
      ...override,
    });

    await expect(promise).rejects.toBeInstanceOf(ValidationError);
    await expect(promise).rejects.toMatchObject({ field });
    expect((await repo.list({}, { limit: 20 })).items).toHaveLength(0);
  });
});

describe("ListTransactions", () => {
  it("mengurutkan transaksi terbaru di atas", async () => {
    const repo = new InMemoryTransactionRepository([
      trx({ id: "a", occurredAt: new Date(2026, 10, 1) }),
      trx({ id: "b", occurredAt: new Date(2026, 10, 9) }),
      trx({ id: "c", occurredAt: new Date(2026, 10, 5) }),
    ]);

    const result = await new ListTransactions(repo).execute();

    expect(result.items.map((t) => t.id)).toEqual(["b", "c", "a"]);
    expect(result.nextCursor).toBeNull();
  });

  it("membagi per halaman dan nextCursor melanjutkan tanpa item dobel", async () => {
    const repo = new InMemoryTransactionRepository(
      ["a", "b", "c", "d", "e"].map((id, index) => trx({ id, occurredAt: new Date(2026, 10, index + 1) })),
    );
    const list = new ListTransactions(repo);

    const first = await list.execute({}, { limit: 2 });
    const second = await list.execute({}, { limit: 2, cursor: first.nextCursor! });
    const third = await list.execute({}, { limit: 2, cursor: second.nextCursor! });

    expect([first, second, third].flatMap((page) => page.items.map((t) => t.id))).toEqual(["e", "d", "c", "b", "a"]);
    expect(third.nextCursor).toBeNull();
  });
});

describe("GetMonthlySummary", () => {
  it("menghitung total dan pengeluaran per kategori hanya untuk bulan yang diminta", async () => {
    const repo = new InMemoryTransactionRepository([
      trx({ id: "1", type: "income", amount: 12_500_000, category: "Gaji", occurredAt: new Date(2026, 10, 1) }),
      trx({ id: "2", amount: 1_850_000, category: "Tagihan", occurredAt: new Date(2026, 10, 2) }),
      trx({ id: "3", amount: 450_000, category: "Tagihan", occurredAt: new Date(2026, 10, 3) }),
      trx({ id: "4", amount: 85_000, category: "Makanan", occurredAt: new Date(2026, 10, 30, 23) }),
      trx({ id: "5", amount: 999_000, category: "Belanja", occurredAt: new Date(2026, 9, 31) }), // Oktober
    ]);

    const summary = await new GetMonthlySummary(repo).execute({ year: 2026, month: 11 });

    expect(summary.totalIncome).toBe(12_500_000);
    expect(summary.totalExpense).toBe(2_385_000);
    expect(summary.netCashflow).toBe(10_115_000);
    expect(summary).toMatchObject({ year: 2026, month: 11, transactionCount: 4, incomeCount: 1, expenseCount: 3 });
    expect(summary.expenseByCategory).toEqual([
      { categoryId: "cat_expense_tagihan", category: "Tagihan", amount: 2_300_000 },
      { categoryId: "cat_expense_makanan", category: "Makanan", amount: 85_000 },
    ]);
  });
});

describe("kategori", () => {
  it("ListCategories mengikuti next_cursor sampai semua halaman terambil", async () => {
    const repo = new InMemoryCategoryRepository();
    const pages: (string | undefined)[] = [];
    const original = repo.list.bind(repo);
    repo.list = (filter, page) => {
      pages.push(page.cursor);
      return original(filter, { ...page, limit: 5 });
    };

    const all = await new ListCategories(repo).execute();

    expect(all).toHaveLength(14);
    expect(pages).toEqual([undefined, "5", "10"]);
  });

  it("CreateCategory merapikan nama dan menolak nama yang sudah ada di field name", async () => {
    const repo = new InMemoryCategoryRepository();
    const create = new CreateCategory(repo);

    expect(await create.execute({ name: "  Bayar   kos ", type: "expense" })).toMatchObject({ name: "Bayar kos", isDefault: false });
    await expect(create.execute({ name: "makanan", type: "expense" })).rejects.toMatchObject({ field: "name", message: "Kategori makanan sudah ada" });
    await expect(create.execute({ name: "   ", type: "expense" })).rejects.toMatchObject({ field: "name" });
    expect((await new ListCategories(repo).execute("expense")).at(-1)?.name).toBe("Bayar kos");
  });

  it("kategori kustom bisa langsung dipakai transaksi dan namanya ikut tersimpan", async () => {
    const categories = new InMemoryCategoryRepository();
    const kos = await new CreateCategory(categories).execute({ name: "Kos", type: "expense" });
    const repo = new InMemoryTransactionRepository([], categories);

    const created = await new CreateTransaction(repo, () => NOW).execute({ type: "expense", amount: 1_500_000, categoryId: kos.id, occurredAt: new Date(2026, 10, 1) });

    expect(created).toMatchObject({ categoryId: kos.id, category: "Kos" });
  });

  it("defaultCategoryIdFor memetakan nama tebakan Catat cepat ke id bawaan", () => {
    expect(defaultCategoryIdFor("expense", "Makanan")).toBe("cat_expense_makanan");
    expect(defaultCategoryIdFor("income", "gaji")).toBe("cat_income_gaji");
    expect(defaultCategoryIdFor("expense", "Tidak dikenal")).toBe("cat_expense_lainnya");
  });
});
