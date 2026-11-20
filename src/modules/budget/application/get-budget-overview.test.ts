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

  it("menganggap bulan lampau tidak punya sisa hari", async () => {
    const overview = await new GetBudgetOverview(new InMemoryBudgetRepository(), transactions(), () => NOW).execute({ year: 2026, month: 10 });
    expect(overview).toMatchObject({ totalSpent: 0, daysLeft: 0 });
  });
});

describe("GetAccountBalances", () => {
  it("menghitung saldo = saldo awal + pemasukan − pengeluaran per akun", async () => {
    const balances = await new GetAccountBalances(new InMemoryAccountRepository(), transactions()).execute();

    expect(balances.total).toBe(9_552_500);
    expect(balances.accounts.map((account) => [account.name, account.balance])).toEqual([
      ["Tunai", 475_000],
      ["Rekening bank", 9_077_500],
    ]);
  });
});
