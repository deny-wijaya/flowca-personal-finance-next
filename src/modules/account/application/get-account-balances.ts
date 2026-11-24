import type { Account, AccountRepository } from "../domain/account";

export type AccountBalance = Account;

export type AccountBalances = {
  accounts: AccountBalance[];
  /** Jumlah saldo semua akun, untuk kartu Total saldo di Dashboard. */
  total: number;
};

/** Batas per halaman saat mengambil akun. Biasanya semua akun muat di satu halaman. */
const ACCOUNT_PAGE_LIMIT = 100;

/**
 * Semua akun milik user beserta saldo saat ini (dihitung backend dari saldo awal dan transaksi).
 * Endpoint-nya memakai pagination, jadi halaman diikuti sampai `nextCursor` habis.
 */
export class GetAccountBalances {
  constructor(private readonly accounts: AccountRepository) {}

  async execute(): Promise<AccountBalances> {
    const all: Account[] = [];
    let cursor: string | undefined;
    do {
      const page = await this.accounts.list({ limit: ACCOUNT_PAGE_LIMIT, cursor });
      all.push(...page.items);
      cursor = page.nextCursor ?? undefined;
    } while (cursor);
    return { accounts: all, total: all.reduce((sum, account) => sum + account.balance, 0) };
  }
}
