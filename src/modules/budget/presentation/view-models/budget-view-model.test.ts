import { describe, expect, it } from "vitest";
import { budgetTone, toBudgetScreen } from "./budget-view-model";

describe("budgetTone", () => {
  it.each([
    [0, "safe"],
    [0.79, "safe"],
    [0.8, "warn"],
    [1, "warn"],
    [1.01, "over"],
  ] as const)("rasio %s -> %s", (ratio, tone) => {
    expect(budgetTone(ratio)).toBe(tone);
  });
});

describe("toBudgetScreen", () => {
  it("memformat ringkasan dan baris persis seperti desain November 2026", () => {
    const vm = toBudgetScreen({
      year: 2026,
      month: 11,
      daysLeft: 11,
      totalLimit: 2_980_000,
      totalSpent: 647_500,
      remaining: 2_332_500,
      items: [
        { category: "Makanan", spent: 47_000, limit: 1_500_000, ratio: 47_000 / 1_500_000 },
        { category: "Tagihan", spent: 150_000, limit: 180_000, ratio: 150_000 / 180_000 },
        { category: "Belanja", spent: 432_500, limit: 400_000, ratio: 432_500 / 400_000 },
        { category: "Hiburan", spent: 0, limit: 300_000, ratio: 0 },
      ],
    });

    expect(vm).toMatchObject({
      subtitle: "November 2026 · 11 hari lagi",
      remaining: "Rp 2.332.500",
      usedPercent: 22,
      totalFilled: 4,
      perDay: "Rp 212.000",
    });
    expect(vm.rows.map((row) => [row.badge, row.filled10, row.note])).toEqual([
      ["Aman", 1, "Sisa Rp 1.453.000"],
      ["Hampir habis", 8, "Sisa Rp 30.000"],
      ["Lewat batas", 10, "Kelebihan Rp 32.500. Kurangi atau naikkan batas."],
      ["Aman", 0, "Sisa Rp 300.000"],
    ]);
  });
});
