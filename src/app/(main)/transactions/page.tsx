import type { Metadata } from "next";
import { Suspense } from "react";
import { SectionSkeleton, TransactionsOverview } from "@/modules/transaction/presentation/sections";

export const metadata: Metadata = { title: "Transaksi" };

export default function TransactionsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Transaksi</h1>
        <p className="text-sm text-neutral-500">Catat pemasukan dan pengeluaran harian.</p>
      </div>
      <Suspense fallback={<SectionSkeleton />}>
        <TransactionsOverview />
      </Suspense>
    </div>
  );
}
