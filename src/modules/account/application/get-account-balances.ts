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
    const [accounts, delta] = await Promise.all([this.accounts.list(), this.transactions.netByAccount()]);

    const withBalance = accounts.map((account) => ({ ...account, balance: account.openingBalance + (delta.get(account.id) ?? 0) }));
    return { accounts: withBalance, total: withBalance.reduce((sum, account) => sum + account.balance, 0) };
  }
}
