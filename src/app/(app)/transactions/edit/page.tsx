import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { container } from "@/di/container";
import { AddTransactionSheet } from "@/modules/transaction/presentation/components/add-transaction-sheet";
import { TransactionsScreen } from "@/modules/transaction/presentation/screens/transactions-screen";
import { parseTransactionFilters, toCategoryOptions } from "@/modules/transaction/presentation/view-models/transaction-view-model";
import { formatThousands, toDateInputValue, toTimeInputValue } from "@/shared/lib/format";
import { ScreenSkeleton } from "../../_components/screen-skeleton";
import { loadTransactionsScreen } from "../load";

export const metadata: Metadata = { title: "Ubah transaksi" };

/**
 * Sheet "Ubah transaksi" (/transactions/edit?id=trx_...), dibuka dengan mengetuk baris transaksi di menu
 * Transaksi atau Dashboard. Mobile: bottom sheet penuh. Desktop: panel kanan di atas layar Transaksi.
 *
 * Id dikirim lewat query string, bukan segmen dinamis /transactions/[id]/edit. Layout aplikasi memakai
 * usePathname(), dan dengan Cache Components alamat yang punya segmen dinamis tidak diketahui saat build,
 * sehingga seluruh layout harus dibungkus Suspense. Query string tidak punya masalah itu.
 */
export default function EditTransactionPage({ searchParams }: PageProps<"/transactions/edit">) {
  return (
    <Suspense fallback={<ScreenSkeleton />}>
      <EditTransactionContent searchParams={searchParams} />
    </Suspense>
  );
}

async function EditTransactionContent({ searchParams }: Pick<PageProps<"/transactions/edit">, "searchParams">) {
  await connection();
  const raw = (await searchParams).id;
  const id = Array.isArray(raw) ? raw[0] : raw;
  if (!id) notFound();
  const now = new Date();
  const [transaction, vm, balances, categories] = await Promise.all([
    container.getTransaction().execute(id),
    loadTransactionsScreen(parseTransactionFilters({}, now), now),
    container.getAccountBalances().execute(),
    container.listCategories().execute(),
  ]);
  if (!transaction) notFound();

  return (
    <>
      <div aria-hidden="true" className="hidden lg:block">
        <TransactionsScreen vm={vm} />
      </div>
      <AddTransactionSheet
        edit={{
          id: transaction.id,
          initial: {
            type: transaction.type === "income" ? "in" : "out",
            amount: formatThousands(transaction.amount),
            categoryId: transaction.categoryId,
            accountId: transaction.accountId ?? "",
            date: toDateInputValue(transaction.occurredAt),
            time: toTimeInputValue(transaction.occurredAt),
            note: transaction.note ?? "",
          },
        }}
        accounts={balances.accounts.map(({ id: accountId, name }) => ({ id: accountId, name }))}
        categories={toCategoryOptions(categories)}
        defaultDate={toDateInputValue(now)}
        defaultTime={toTimeInputValue(now)}
        closeHref="/transactions"
      />
    </>
  );
}
