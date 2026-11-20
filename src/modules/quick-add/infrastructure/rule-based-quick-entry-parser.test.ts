import { describe, expect, it } from "vitest";
import { RuleBasedQuickEntryParser } from "./rule-based-quick-entry-parser";

const parser = new RuleBasedQuickEntryParser();

describe("RuleBasedQuickEntryParser", () => {
  it("memecah satu kalimat menjadi beberapa draf", async () => {
    const drafts = await parser.parse("kopi 22rb, ojek 18rb pakai bank");

    expect(drafts).toEqual([
      { name: "Kopi", category: "Makanan", accountId: "cash", type: "expense", amount: 22_000, day: "today" },
      { name: "Ojek", category: "Transportasi", accountId: "bank", type: "expense", amount: 18_000, day: "today" },
    ]);
  });

  it("mengenali pemasukan, satuan juta, dan kata kemarin", async () => {
    expect(await parser.parse("Gaji masuk 6,5jt ke bank")).toMatchObject([{ type: "income", category: "Gaji", amount: 6_500_000, accountId: "bank" }]);
    expect(await parser.parse("Token listrik 150rb kemarin")).toMatchObject([{ category: "Tagihan", amount: 150_000, day: "yesterday" }]);
  });

  it("mengembalikan daftar kosong bila nominal tidak terbaca", async () => {
    expect(await parser.parse("beli kopi tadi pagi")).toEqual([]);
  });
});
