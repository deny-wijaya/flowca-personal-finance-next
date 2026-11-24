import "server-only";
import { container } from "@/di/container";
import type { TransactionsScreenVM } from "@/modules/transaction/presentation/screens/transactions-screen";
import {
  ALL_CATEGORIES,
  toMonthNav,
  toSummaryStrip,
  toTransactionFilter,
  toTransactionRow,
  type TransactionListFilters,
} from "@/modules/transaction/presentation/view-models/transaction-view-model";
import { DEFAULT_PAGE_LIMIT } from "@/shared/domain/pagination";
import { parseMonthParam } from "@/shared/lib/month";
import { loadTransactionContext } from "../_components/load-context";

/**
 * Data layar Transaksi; dipakai /transactions dan /transactions/new (latar sheet).
 * Daftar hanya halaman pertama (20 transaksi). Angka ringkasan dan jumlah transaksi dari GET /summary,
 * jadi tetap benar walaupun daftar belum dimuat semua.
 */
export async function loadTransactionsScreen(filters: TransactionListFilters, now: Date): Promise<TransactionsScreenVM> {
  const month = parseMonthParam(filters.month, now);
  const [page, summary, ctx] = await Promise.all([
    container.listTransactions().execute(toTransactionFilter(filters, now), { limit: DEFAULT_PAGE_LIMIT }),
    container.getMonthlySummary().execute(month),
    loadTransactionContext(now),
  ]);
  return {
    monthNav: toMonthNav("/transactions", month, now),
    summary: toSummaryStrip(summary),
    filters,
    firstPage: { rows: page.items.map((trx) => toTransactionRow(trx, ctx)), nextCursor: page.nextCursor },
    totalCount: summary.transactionCount,
    categories: [...ALL_CATEGORIES],
    accounts: [...ctx.accountNames.values()],
  };
}
