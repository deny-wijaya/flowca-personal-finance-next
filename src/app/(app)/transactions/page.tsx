import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";
import { TransactionsScreen } from "@/modules/transaction/presentation/screens/transactions-screen";
import { parseTransactionFilters } from "@/modules/transaction/presentation/view-models/transaction-view-model";
import { ScreenSkeleton } from "../_components/screen-skeleton";
import { loadTransactionsScreen } from "./load";

export const metadata: Metadata = { title: "Transaksi" };

export default function TransactionsPage({ searchParams }: PageProps<"/transactions">) {
  return (
    <Suspense fallback={<ScreenSkeleton />}>
      <TransactionsContent searchParams={searchParams} />
    </Suspense>
  );
}

async function TransactionsContent({ searchParams }: Pick<PageProps<"/transactions">, "searchParams">) {
  await connection();
  const now = new Date();
  const vm = await loadTransactionsScreen(parseTransactionFilters(await searchParams, now), now);
  return <TransactionsScreen vm={vm} />;
}
