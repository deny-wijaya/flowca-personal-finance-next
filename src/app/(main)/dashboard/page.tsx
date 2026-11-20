import type { Metadata } from "next";
import { Suspense } from "react";
import { DashboardOverview, SectionSkeleton } from "@/modules/transaction/presentation/sections";

export const metadata: Metadata = { title: "Dashboard" };

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-sm text-neutral-500">Ringkasan keuangan bulan ini.</p>
      </div>
      <Suspense fallback={<SectionSkeleton />}>
        <DashboardOverview />
      </Suspense>
    </div>
  );
}
