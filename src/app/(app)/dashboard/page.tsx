import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";
import { container } from "@/di/container";
import { toUserVM } from "@/modules/auth/presentation/view-models/user-view-model";
import { DashboardScreen } from "@/modules/dashboard/presentation/screens/dashboard-screen";
import { DASHBOARD_RECENT_LIMIT, toDashboardVM } from "@/modules/dashboard/presentation/view-models/dashboard-view-model";
import { toMonthNav } from "@/modules/transaction/presentation/view-models/transaction-view-model";
import { monthRange, parseMonthParam } from "@/shared/lib/month";
import { loadTransactionContext } from "../_components/load-context";
import { ScreenSkeleton } from "../_components/screen-skeleton";

export const metadata: Metadata = { title: "Beranda" };

export default function DashboardPage({ searchParams }: PageProps<"/dashboard">) {
  return (
    <Suspense fallback={<ScreenSkeleton />}>
      <DashboardContent searchParams={searchParams} />
    </Suspense>
  );
}

async function DashboardContent({ searchParams }: Pick<PageProps<"/dashboard">, "searchParams">) {
  await connection();
  const now = new Date();
  const month = parseMonthParam((await searchParams).month, now);
  const [user, balances, recent, summary, budget, ctx] = await Promise.all([
    container.auth().currentUser(),
    container.getAccountBalances().execute(),
    container.listTransactions().execute(monthRange(month), { limit: DASHBOARD_RECENT_LIMIT }),
    container.getMonthlySummary().execute(month),
    container.getBudgetOverview().execute(month),
    loadTransactionContext(now),
  ]);

  const vm = toDashboardVM({ user: toUserVM(user), now, month: month.month, monthNav: toMonthNav("/dashboard", month, now), balances, summary, recent: recent.items, budget, ctx });
  return <DashboardScreen vm={vm} />;
}
