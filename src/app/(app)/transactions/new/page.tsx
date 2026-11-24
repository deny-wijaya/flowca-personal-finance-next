import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";
import { container } from "@/di/container";
import { AddTransactionSheet } from "@/modules/transaction/presentation/components/add-transaction-sheet";
import { TransactionsScreen } from "@/modules/transaction/presentation/screens/transactions-screen";
import { toDateInputValue, toTimeInputValue } from "@/shared/lib/format";
import { parseTransactionFilters, toCategoryOptions } from "@/modules/transaction/presentation/view-models/transaction-view-model";
import { ScreenSkeleton } from "../../_components/screen-skeleton";
import { loadTransactionsScreen } from "../load";

export const metadata: Metadata = { title: "Tambah transaksi" };

/** Mobile: bottom sheet penuh. Desktop: panel kanan 400px di atas layar Transaksi. */
export default function NewTransactionPage() {
  return (
    <Suspense fallback={<ScreenSkeleton />}>
      <NewTransactionContent />
    </Suspense>
  );
}

async function NewTransactionContent() {
  await connection();
  const now = new Date();
  const [vm, balances, categories] = await Promise.all([
    loadTransactionsScreen(parseTransactionFilters({}, now), now),
    container.getAccountBalances().execute(),
    container.listCategories().execute(),
  ]);
  return (
    <>
      <div aria-hidden="true" className="hidden lg:block">
        <TransactionsScreen vm={vm} />
      </div>
      <AddTransactionSheet
        accounts={balances.accounts.map(({ id, name }) => ({ id, name }))}
        categories={toCategoryOptions(categories)}
        defaultDate={toDateInputValue(now)}
        defaultTime={toTimeInputValue(now)}
        closeHref="/dashboard"
      />
    </>
  );
}
