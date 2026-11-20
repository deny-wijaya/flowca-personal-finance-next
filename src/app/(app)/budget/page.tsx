import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";
import { container } from "@/di/container";
import { BudgetScreen } from "@/modules/budget/presentation/screens/budget-screen";
import { toBudgetScreen } from "@/modules/budget/presentation/view-models/budget-view-model";
import { parseMonthParam } from "@/shared/lib/month";
import { ScreenSkeleton } from "../_components/screen-skeleton";

export const metadata: Metadata = { title: "Anggaran" };

export default function BudgetPage({ searchParams }: PageProps<"/budget">) {
  return (
    <Suspense fallback={<ScreenSkeleton />}>
      <BudgetContent searchParams={searchParams} />
    </Suspense>
  );
}

async function BudgetContent({ searchParams }: Pick<PageProps<"/budget">, "searchParams">) {
  await connection();
  const overview = await container.getBudgetOverview().execute(parseMonthParam((await searchParams).month));
  return <BudgetScreen vm={toBudgetScreen(overview)} />;
}
