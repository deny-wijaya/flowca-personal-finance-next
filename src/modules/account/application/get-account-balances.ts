import type { TransactionRepository } from "@/modules/transaction/domain/transaction-repository";
import type { Account, AccountRepository } from "../domain/account";

export type AccountBalance = Account & { balance: number };

export type AccountBalances = {
  accounts: AccountBalance[];
  total: number;
};

/** Saldo tiap akun = saldo awal + pemasukan − pengeluaran yang tercatat di akun itu. */
export class GetAccountBalances {
  constructor(
    private readonly accounts: AccountRepository,
    private readonly transactions: TransactionRepository,
  ) {}

  async execute(): Promise<AccountBalances> {
    const [accounts, transactions] = await Promise.all([this.accounts.list(), this.transactions.list()]);
    const delta = new Map<string, number>();

    for (const trx of transactions) {
      if (!trx.accountId) continue;
      const signed = trx.type === "income" ? trx.amount : -trx.amount;
      delta.set(trx.accountId, (delta.get(trx.accountId) ?? 0) + signed);
    }

    const withBalance = accounts.map((account) => ({ ...account, balance: account.openingBalance + (delta.get(account.id) ?? 0) }));
    return { accounts: withBalance, total: withBalance.reduce((sum, account) => sum + account.balance, 0) };
  }
}
