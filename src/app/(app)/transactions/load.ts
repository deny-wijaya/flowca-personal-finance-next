import "server-only";
import { container } from "@/di/container";
import { TRANSACTION_CATEGORIES } from "@/modules/transaction/domain/transaction";
import type { TransactionsScreenVM } from "@/modules/transaction/presentation/screens/transactions-screen";
import { groupByDay, toMonthNav, toSummaryStrip, toTransactionRow } from "@/modules/transaction/presentation/view-models/transaction-view-model";
import { monthRange, type MonthRef } from "@/shared/lib/month";
import { loadTransactionContext } from "../_components/load-context";

/** Data layar Transaksi untuk satu bulan; dipakai /transactions dan /transactions/new (latar sheet). */
export async function loadTransactionsScreen(month: MonthRef, now: Date): Promise<TransactionsScreenVM> {
  const [transactions, ctx] = await Promise.all([container.listTransactions().execute(monthRange(month)), loadTransactionContext(now)]);
  const categories = [...new Set([...TRANSACTION_CATEGORIES.expense, ...TRANSACTION_CATEGORIES.income])];
  return {
    monthNav: toMonthNav("/transactions", month, now),
    summary: toSummaryStrip(transactions),
    groups: groupByDay(transactions, ctx),
    rows: transactions.map((trx) => toTransactionRow(trx, ctx)),
    categories,
    accounts: [...ctx.accountNames.values()],
  };
}
