import { formatCurrency, formatDate } from "@/shared/lib/format";
import type { Transaction } from "../../domain/transaction";

export function TransactionList({ transactions }: { transactions: Transaction[] }) {
  if (transactions.length === 0) {
    return <p className="py-6 text-center text-sm text-neutral-500">Belum ada transaksi di periode ini.</p>;
  }

  return (
    <ul className="divide-y divide-black/5 dark:divide-white/10">
      {transactions.map((trx) => (
        <li key={trx.id} className="flex items-center justify-between gap-4 py-3">
          <div className="min-w-0">
            <p className="truncate font-medium">{trx.note ?? trx.category}</p>
            <p className="text-xs text-neutral-500">
              {trx.category} · {formatDate(trx.occurredAt)}
            </p>
          </div>
          <p
            className={`shrink-0 font-semibold tabular-nums ${
              trx.type === "income" ? "text-emerald-600" : "text-rose-600"
            }`}
          >
            {trx.type === "income" ? "+" : "−"}
            {formatCurrency(trx.amount)}
          </p>
        </li>
      ))}
    </ul>
  );
}
