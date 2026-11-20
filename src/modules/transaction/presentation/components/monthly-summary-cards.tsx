import { Card, CardTitle } from "@/shared/ui/card";
import { formatCurrency } from "@/shared/lib/format";
import type { MonthlySummary } from "../../application/get-monthly-summary";

export function MonthlySummaryCards({ summary }: { summary: MonthlySummary }) {
  const items = [
    { label: "Pemasukan", value: summary.totalIncome, className: "text-emerald-600" },
    { label: "Pengeluaran", value: summary.totalExpense, className: "text-rose-600" },
    {
      label: "Arus kas bersih",
      value: summary.netCashflow,
      className: summary.netCashflow >= 0 ? "text-emerald-600" : "text-rose-600",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {items.map((item) => (
        <Card key={item.label}>
          <CardTitle>{item.label}</CardTitle>
          <p className={`mt-2 text-2xl font-semibold tabular-nums ${item.className}`}>{formatCurrency(item.value)}</p>
        </Card>
      ))}
    </div>
  );
}

export function ExpenseByCategory({ summary }: { summary: MonthlySummary }) {
  if (summary.expenseByCategory.length === 0) {
    return <p className="text-sm text-neutral-500">Belum ada pengeluaran bulan ini.</p>;
  }

  return (
    <ul className="space-y-3">
      {summary.expenseByCategory.map((row) => {
        const percent = summary.totalExpense > 0 ? Math.round((row.amount / summary.totalExpense) * 100) : 0;
        return (
          <li key={row.category}>
            <div className="flex justify-between text-sm">
              <span>{row.category}</span>
              <span className="tabular-nums text-neutral-500">
                {formatCurrency(row.amount)} · {percent}%
              </span>
            </div>
            <div className="mt-1 h-2 rounded-full bg-neutral-100 dark:bg-neutral-800">
              <div className="h-2 rounded-full bg-rose-500" style={{ width: `${percent}%` }} />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
