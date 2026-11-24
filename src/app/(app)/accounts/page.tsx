import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";
import { container } from "@/di/container";
import { AccountsScreen } from "@/modules/account/presentation/screens/accounts-screen";
import { toAccountsScreenVM } from "@/modules/account/presentation/view-models/account-view-model";
import { ScreenSkeleton } from "../_components/screen-skeleton";

export const metadata: Metadata = { title: "Akun" };

export default function AccountsPage() {
  return (
    <Suspense fallback={<ScreenSkeleton />}>
      <AccountsContent />
    </Suspense>
  );
}

async function AccountsContent() {
  await connection();
  const balances = await container.getAccountBalances().execute();
  return <AccountsScreen vm={toAccountsScreenVM(balances)} />;
}
