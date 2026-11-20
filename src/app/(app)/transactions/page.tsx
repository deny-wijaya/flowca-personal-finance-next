import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";
import { TransactionsScreen } from "@/modules/transaction/presentation/screens/transactions-screen";
import { parseMonthParam } from "@/shared/lib/month";
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
  const vm = await loadTransactionsScreen(parseMonthParam((await searchParams).month, now), now);
  return <TransactionsScreen vm={vm} />;
}
