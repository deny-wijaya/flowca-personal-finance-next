import { describe, expect, it } from "vitest";
import { createSeedTransactions } from "../../infrastructure/in-memory-transaction-repository";
import {
  groupRows,
  parseTransactionFilters,
  toMonthNav,
  toSummaryStrip,
  toTransactionFilter,
  toTransactionRow,
  transactionsHref,
} from "./transaction-view-model";

const NOW = new Date(2026, 10, 19, 22, 0);
const ctx = { now: NOW, accountNames: new Map([["cash", "Tunai"], ["bank", "Rekening bank"]]) };
const seed = createSeedTransactions(NOW).sort((a, b) => b.occurredAt.getTime() - a.occurredAt.getTime());

describe("transaction view model", () => {
  it("memetakan transaksi ke baris bertanda dengan tone kategori", () => {
    expect(toTransactionRow(seed[0], ctx)).toMatchObject({
      name: "Makan siang",
      initial: "M",
      tone: "orange",
      account: "Tunai",
      amount: "−Rp 25.000",
      direction: "out",
      dayLabel: "Kam, 19 Nov",
      time: "12.30",
      relativeDay: "Hari ini",
    });
  });

  it("mengelompokkan per hari dengan label relatif dan total bertanda", () => {
    const groups = groupRows(seed.map((trx) => toTransactionRow(trx, ctx)));
    expect(groups.map((g) => [g.label, g.sum, g.rows.length])).toEqual([
      ["Hari ini · Kam, 19 Nov", "−Rp 47.000", 2],
      ["Kemarin · Rab, 18 Nov", "−Rp 168.000", 2],
      ["Min, 15 Nov", "+Rp 1.200.000", 1],
      ["Sab, 14 Nov", "−Rp 432.500", 1],
      ["Min, 1 Nov", "+Rp 6.500.000", 1],
    ]);
    expect(groups[0].rows[0].meta).toBe("Makanan · Tunai · 12.30");
  });

  it("menghitung ringkasan masuk, keluar, dan selisih", () => {
    expect(toSummaryStrip({ totalIncome: 7_700_000, totalExpense: 647_500, netCashflow: 7_052_500 })).toEqual({
      totalIn: "Rp 7.700.000",
      totalOut: "Rp 647.500",
      net: "Rp 7.052.500",
    });
  });

  it("membaca filter dari URL dan membuang nilai yang tidak dikenal", () => {
    expect(parseTransactionFilters({ month: "2026-10", q: "  gojek ", type: "out", category: "Transportasi" }, NOW)).toEqual({
      month: "2026-10",
      q: "gojek",
      type: "out",
      category: "Transportasi",
    });
    expect(parseTransactionFilters({ month: "bulan-lalu", type: "semua", category: "Bukan kategori" }, NOW)).toEqual({
      month: "2026-11",
      q: "",
      type: "all",
      category: "",
    });
  });

  it("mengubah filter URL menjadi filter backend dan kembali menjadi URL", () => {
    const filters = { month: "2026-11", q: "kopi", type: "out" as const, category: "" };
    expect(toTransactionFilter(filters, NOW)).toEqual({
      from: new Date(2026, 10, 1),
      to: new Date(2026, 10, 30, 23, 59, 59, 999),
      type: "expense",
      category: undefined,
      q: "kopi",
    });
    expect(transactionsHref(filters)).toBe("/transactions?month=2026-11&q=kopi&type=out");
  });

  it("tidak memberi link ke bulan di masa depan", () => {
    expect(toMonthNav("/transactions", { year: 2026, month: 11 }, NOW)).toEqual({
      label: "November 2026",
      shortLabel: "Nov 2026",
      prevHref: "/transactions?month=2026-10",
      nextHref: undefined,
    });
  });
});
