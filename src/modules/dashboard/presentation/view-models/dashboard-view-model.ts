import type { AccountBalances } from "@/modules/account/application/get-account-balances";
import type { UserVM } from "@/modules/auth/presentation/view-models/user-view-model";
import type { BudgetOverview } from "@/modules/budget/application/get-budget-overview";
import { toBudgetRow, type BudgetRowVM } from "@/modules/budget/presentation/view-models/budget-view-model";
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
  /** Transaksi bulan yang dilihat, terbaru di atas. */
  transactions: Transaction[];
  budget: BudgetOverview;
  ctx: TransactionContext;
};

export function toDashboardVM({ user, now, month, monthNav, balances, transactions, budget, ctx }: DashboardInput): DashboardVM {
  const incomes = transactions.filter((trx) => trx.type === "income");
  const expenses = transactions.filter((trx) => trx.type === "expense");
  const sum = (list: Transaction[]) => list.reduce((total, trx) => total + trx.amount, 0);
  const monthShort = formatShortMonth(month);
  const rows = transactions.map((trx) => toTransactionRow(trx, ctx));
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();

  return {
    user,
    dateLine: `${formatLongDate(now)} · ${lastDay - now.getDate()} hari lagi menuju akhir bulan`,
    monthNav,
    balance: {
      total: formatRupiah(balances.total),
      caption: `${balances.accounts.length} akun · ${balances.accounts.map((account) => account.name).join(", ")}`,
    },
    income: { label: `Masuk · ${monthShort}`, value: formatRupiah(sum(incomes)), caption: `${incomes.length} transaksi` },
    expense: { label: `Keluar · ${monthShort}`, value: formatRupiah(sum(expenses)), caption: `${expenses.length} transaksi` },
    budget: {
      remaining: `${budget.remaining < 0 ? "−" : ""}${formatRupiah(budget.remaining)}`,
      caption: `dari ${formatRupiah(budget.totalLimit)}`,
      rows: budget.items.map(toBudgetRow),
    },
    recentMobile: rows.slice(0, 3).map((row) => ({ ...row, meta: rowMetaWithRelativeTime(row) })),
    recentDesktop: rows.slice(0, 5).map((row) => ({ ...row, meta: rowMetaWithDay(row) })),
  };
}
