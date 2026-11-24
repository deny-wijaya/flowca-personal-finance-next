import type { AccountBalances } from "@/modules/account/application/get-account-balances";
import type { UserVM } from "@/modules/auth/presentation/view-models/user-view-model";
import type { BudgetOverview } from "@/modules/budget/application/get-budget-overview";
import { toBudgetRow, type BudgetRowVM } from "@/modules/budget/presentation/view-models/budget-view-model";
import type { MonthlySummary } from "@/modules/transaction/application/get-monthly-summary";
import type { Transaction } from "@/modules/transaction/domain/transaction";
import {
  rowMetaWithDay,
  rowMetaWithRelativeTime,
  toTransactionRow,
  type MonthNavVM,
  type TransactionContext,
  type TransactionRowVM,
} from "@/modules/transaction/presentation/view-models/transaction-view-model";
import { formatLongDate, formatRupiah, formatShortMonth } from "@/shared/lib/format";

type RecentRow = TransactionRowVM & { meta: string };

export type DashboardVM = {
  user: UserVM;
  /** "Kamis, 19 November 2026 · 11 hari lagi menuju akhir bulan" */
  dateLine: string;
  monthNav: MonthNavVM;
  balance: { total: string; caption: string };
  income: { label: string; value: string; caption: string };
  expense: { label: string; value: string; caption: string };
  budget: { remaining: string; caption: string; rows: BudgetRowVM[] };
  recentMobile: RecentRow[];
  recentDesktop: RecentRow[];
};

type DashboardInput = {
  user: UserVM;
  now: Date;
  month: number;
  monthNav: MonthNavVM;
  balances: AccountBalances;
  /** Total bulan yang dilihat, dari GET /summary. */
  summary: MonthlySummary;
  /** Beberapa transaksi terbaru bulan yang dilihat (satu halaman kecil), terbaru di atas. */
  recent: Transaction[];
  budget: BudgetOverview;
  ctx: TransactionContext;
};

/** Jumlah transaksi terbaru yang tampil di kartu transaksi terakhir (desktop 5, mobile 3). */
export const DASHBOARD_RECENT_LIMIT = 5;

export function toDashboardVM({ user, now, month, monthNav, balances, summary, recent, budget, ctx }: DashboardInput): DashboardVM {
  const monthShort = formatShortMonth(month);
  const rows = recent.map((trx) => toTransactionRow(trx, ctx));
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();

  return {
    user,
    dateLine: `${formatLongDate(now)} · ${lastDay - now.getDate()} hari lagi menuju akhir bulan`,
    monthNav,
    balance: {
      total: formatRupiah(balances.total),
      caption: `${balances.accounts.length} akun · ${balances.accounts.map((account) => account.name).join(", ")}`,
    },
    income: { label: `Masuk · ${monthShort}`, value: formatRupiah(summary.totalIncome), caption: `${summary.incomeCount} transaksi` },
    expense: { label: `Keluar · ${monthShort}`, value: formatRupiah(summary.totalExpense), caption: `${summary.expenseCount} transaksi` },
    budget: {
      remaining: `${budget.remaining < 0 ? "−" : ""}${formatRupiah(budget.remaining)}`,
      caption: `dari ${formatRupiah(budget.totalLimit)}`,
      rows: budget.items.map(toBudgetRow),
    },
    recentMobile: rows.slice(0, 3).map((row) => ({ ...row, meta: rowMetaWithRelativeTime(row) })),
    recentDesktop: rows.slice(0, DASHBOARD_RECENT_LIMIT).map((row) => ({ ...row, meta: rowMetaWithDay(row) })),
  };
}
