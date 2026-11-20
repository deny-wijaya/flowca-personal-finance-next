import { categoryInitial, categoryTone } from "@/modules/transaction/presentation/view-models/category-tone";
import type { CategoryTileTone } from "@/shared/ui/primitives/category-tile";
import { formatMonthYear, formatRupiah, formatThousands } from "@/shared/lib/format";
import type { BudgetOverview, BudgetUsage } from "../../application/get-budget-overview";

export type BudgetStatus = "safe" | "warn" | "over";

/** Satu-satunya aturan warna status anggaran: ≥ 80% hampir habis, > 100% lewat batas. */
export function budgetTone(ratio: number): BudgetStatus {
  if (ratio > 1) return "over";
  if (ratio >= 0.8) return "warn";
  return "safe";
}

const STATUS_LABEL: Record<BudgetStatus, string> = { safe: "Aman", warn: "Hampir habis", over: "Lewat batas" };

/** Jumlah segmen terisi; ada pengeluaran sekecil apa pun tetap tampil minimal 1 segmen. */
export function filledSegments(usage: Pick<BudgetUsage, "ratio" | "spent">, segments: number) {
  if (usage.ratio > 1) return segments;
  const filled = Math.round(usage.ratio * segments);
  return usage.spent > 0 && filled === 0 ? 1 : filled;
}

export type BudgetRowVM = {
  category: string;
  initial: string;
  tone: CategoryTileTone;
  status: BudgetStatus;
  badge: string;
  /** "Rp 47.000 dari Rp 1.500.000" */
  detail: string;
  /** "Rp 47.000 / Rp 1.500.000" */
  compactDetail: string;
  filled10: number;
  filled20: number;
  note: string;
  noteTone: "muted" | "danger";
};

export function toBudgetRow(usage: BudgetUsage): BudgetRowVM {
  const status = budgetTone(usage.ratio);
  const over = status === "over";
  return {
    category: usage.category,
    initial: categoryInitial(usage.category),
    tone: categoryTone(usage.category),
    status,
    badge: STATUS_LABEL[status],
    detail: `${formatRupiah(usage.spent)} dari ${formatRupiah(usage.limit)}`,
    compactDetail: `${formatRupiah(usage.spent)} / ${formatRupiah(usage.limit)}`,
    filled10: filledSegments(usage, 10),
    filled20: filledSegments(usage, 20),
    note: over ? `Kelebihan ${formatRupiah(usage.spent - usage.limit)}. Kurangi atau naikkan batas.` : `Sisa ${formatRupiah(usage.limit - usage.spent)}`,
    noteTone: over ? "danger" : "muted",
  };
}

export type BudgetScreenVM = {
  /** "November 2026 · 11 hari lagi" */
  subtitle: string;
  remaining: string;
  spent: string;
  limit: string;
  usedPercent: number;
  /** Segmen terisi dari 20 (5% per segmen). */
  totalFilled: number;
  /** "Rp 212.000" per hari, dibulatkan ke bawah per seribu. */
  perDay: string;
  categoryCount: number;
  rows: BudgetRowVM[];
};

export function toBudgetScreen(overview: BudgetOverview): BudgetScreenVM {
  const usedPercent = overview.totalLimit > 0 ? Math.min(100, Math.round((overview.totalSpent / overview.totalLimit) * 100)) : 0;
  const perDayRaw = overview.daysLeft > 0 ? Math.max(0, overview.remaining) / overview.daysLeft : 0;
  return {
    subtitle: `${formatMonthYear(overview.year, overview.month)} · ${overview.daysLeft} hari lagi`,
    remaining: `${overview.remaining < 0 ? "−" : ""}${formatRupiah(overview.remaining)}`,
    spent: formatRupiah(overview.totalSpent),
    limit: formatRupiah(overview.totalLimit),
    usedPercent,
    totalFilled: Math.round(usedPercent / 5),
    perDay: `Rp ${formatThousands(Math.floor(perDayRaw / 1000) * 1000)}`,
    categoryCount: overview.items.length,
    rows: overview.items.map(toBudgetRow),
  };
}
