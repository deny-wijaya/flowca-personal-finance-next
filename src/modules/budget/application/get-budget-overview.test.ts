import { describe, expect, it } from "vitest";
import { GetAccountBalances } from "@/modules/account/application/get-account-balances";
import { InMemoryAccountRepository } from "@/modules/account/infrastructure/in-memory-account-repository";
import { createSeedTransactions, InMemoryTransactionRepository } from "@/modules/transaction/infrastructure/in-memory-transaction-repository";
import { InMemoryBudgetRepository } from "../infrastructure/in-memory-budget-repository";
import { GetBudgetOverview } from "./get-budget-overview";

const NOW = new Date(2026, 10, 19, 22, 0);
const transactions = () => new InMemoryTransactionRepository(createSeedTransactions(NOW));

describe("GetBudgetOverview", () => {
  it("menjumlahkan pengeluaran per kategori dan sisa hari bulan berjalan", async () => {
    const overview = await new GetBudgetOverview(new InMemoryBudgetRepository(), transactions(), () => NOW).execute({ year: 2026, month: 11 });

    expect(overview).toMatchObject({ totalLimit: 2_980_000, totalSpent: 647_500, remaining: 2_332_500, daysLeft: 11 });
    expect(overview.items.find((item) => item.category === "Belanja")).toMatchObject({ spent: 432_500, limit: 400_000 });
  });

  it("tanpa anggaran: tidak ada item dan total 0", async () => {
    const overview = await new GetBudgetOverview(new InMemoryBudgetRepository([]), transactions(), () => NOW).execute({ year: 2026, month: 11 });
    expect(overview).toMatchObject({ items: [], totalLimit: 0, totalSpent: 0, remaining: 0 });
  });

  it("menggabungkan batas dan pengeluaran lewat categoryId, termasuk kategori kustom", async () => {
    const budgets = new InMemoryBudgetRepository([{ categoryId: "cat_kos", category: "Kos", limit: 1_500_000 }]);
    const overview = await new GetBudgetOverview(budgets, transactions(), () => NOW).execute({ year: 2026, month: 11 });
    expect(overview.items).toEqual([{ categoryId: "cat_kos", category: "Kos", limit: 1_500_000, spent: 0, ratio: 0 }]);
  });

  it("menganggap bulan lampau tidak punya sisa hari", async () => {
    const overview = await new GetBudgetOverview(new InMemoryBudgetRepository(), transactions(), () => NOW).execute({ year: 2026, month: 10 });
    expect(overview).toMatchObject({ totalSpent: 0, daysLeft: 0 });
  });
});

describe("GetAccountBalances", () => {
  it("menghitung saldo = saldo awal + pemasukan − pengeluaran per akun", async () => {
    const repo = transactions();
    const balances = await new GetAccountBalances(new InMemoryAccountRepository(() => repo.netByAccount())).execute();

    expect(balances.total).toBe(9_552_500);
    expect(balances.accounts.map((account) => [account.name, account.balance])).toEqual([
      ["Tunai", 475_000],
      ["Rekening bank", 9_077_500],
    ]);
  });
});

describe("GetAccountBalances dengan banyak halaman", () => {
  it("mengikuti nextCursor sampai semua akun terambil", async () => {
    const seed = Array.from({ length: 105 }, (_, i) => ({ id: `acc_${i}`, name: `Akun ${i}`, kind: "cash" as const, openingBalance: 1_000 }));
    const balances = await new GetAccountBalances(new InMemoryAccountRepository(undefined, seed)).execute();
    expect(balances.accounts).toHaveLength(105);
    expect(balances.total).toBe(105_000);
  });
});
