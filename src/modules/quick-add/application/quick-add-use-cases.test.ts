import { describe, expect, it } from "vitest";
import { CreateTransaction } from "@/modules/transaction/application/create-transaction";
import { InMemoryTransactionRepository } from "@/modules/transaction/infrastructure/in-memory-transaction-repository";
import { SaveQuickDrafts } from "./quick-add-use-cases";

describe("SaveQuickDrafts", () => {
  it("menyimpan draf sebagai transaksi, 'kemarin' mundur satu hari", async () => {
    const now = new Date(2026, 10, 19, 10, 0);
    const repo = new InMemoryTransactionRepository();
    await new SaveQuickDrafts(new CreateTransaction(repo, () => now), () => now).execute([
      { name: "Token listrik", category: "Tagihan", accountId: "bank", type: "expense", amount: 150_000, day: "yesterday" },
    ]);

    const [saved] = await repo.list();
    expect(saved).toMatchObject({ note: "Token listrik", category: "Tagihan", accountId: "bank", amount: 150_000 });
    expect(saved.occurredAt.getDate()).toBe(18);
  });
});
