import "server-only";
import { connection } from "next/server";
import { container } from "@/di/container";
import { toDateInputValue } from "@/shared/lib/format";
import { Card, CardTitle } from "@/shared/ui/card";
import { ExpenseByCategory, MonthlySummaryCards } from "./components/monthly-summary-cards";
import { TransactionForm } from "./components/transaction-form";
import { TransactionList } from "./components/transaction-list";

/**
 * Server Component yang mengambil data lewat use case.
 * Data keuangan selalu per-request (tidak di-cache), jadi setiap section
 * memanggil `connection()` dan dibungkus <Suspense> di page.
 */

function currentMonthRange(now: Date) {
  return {
    year: now.getFullYear(),
    month: now.getMonth() + 1,
    from: new Date(now.getFullYear(), now.getMonth(), 1),
    to: new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999),
  };
}

export async function DashboardOverview() {
  await connection();
  const { year, month, from, to } = currentMonthRange(new Date());

  const [summary, transactions] = await Promise.all([
    container.getMonthlySummary().execute({ year, month }),
    container.listTransactions().execute({ from, to }),
  ]);

  return (
    <div className="space-y-6">
      <MonthlySummaryCards summary={summary} />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardTitle>Pengeluaran per kategori</CardTitle>
          <div className="mt-4">
            <ExpenseByCategory summary={summary} />
          </div>
        </Card>
        <Card>
          <CardTitle>5 transaksi terakhir</CardTitle>
          <div className="mt-2">
            <TransactionList transactions={transactions.slice(0, 5)} />
          </div>
        </Card>
      </div>
    </div>
  );
}

export async function TransactionsOverview() {
  await connection();
  const now = new Date();
  const { from, to } = currentMonthRange(now);
  const transactions = await container.listTransactions().execute({ from, to });

  return (
    <div className="grid gap-6 lg:grid-cols-[2fr_3fr]">
      <Card>
        <CardTitle>Tambah transaksi</CardTitle>
        <div className="mt-4">
          <TransactionForm defaultDate={toDateInputValue(now)} />
        </div>
      </Card>
      <Card>
        <CardTitle>Transaksi bulan ini ({transactions.length})</CardTitle>
        <div className="mt-2">
          <TransactionList transactions={transactions} />
        </div>
      </Card>
    </div>
  );
}

export function SectionSkeleton() {
  return (
    <div className="grid animate-pulse gap-4 sm:grid-cols-3" aria-label="Memuat data">
      {Array.from({ length: 3 }, (_, i) => (
        <div key={i} className="h-24 rounded-xl bg-neutral-200 dark:bg-neutral-800" />
      ))}
    </div>
  );
}
