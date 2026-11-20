import "server-only";
import { container } from "@/di/container";
import type { TransactionContext } from "@/modules/transaction/presentation/view-models/transaction-view-model";

/** Nama akun untuk mapper transaksi (id -> "Tunai"). Dipakai beberapa page. */
export async function loadTransactionContext(now: Date): Promise<TransactionContext> {
  const { accounts } = await container.getAccountBalances().execute();
  return { now, accountNames: new Map(accounts.map((account) => [account.id, account.name])) };
}
