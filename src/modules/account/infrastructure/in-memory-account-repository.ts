import { ValidationError } from "@/shared/domain/errors";
import type { Page, PageRequest } from "@/shared/domain/pagination";
import type { Account, AccountRepository, NewAccount } from "../domain/account";

type StoredAccount = Omit<Account, "balance">;

/**
 * Akun tanpa backend (DATA_SOURCE=mock dan unit test). Saldo dihitung dari `netByAccount`, yaitu
 * selisih pemasukan − pengeluaran per id akun dari repository transaksi, meniru hitungan di backend.
 */
export class InMemoryAccountRepository implements AccountRepository {
  private accounts: StoredAccount[];

  constructor(
    private readonly netByAccount: () => Promise<ReadonlyMap<string, number>> = async () => new Map(),
    seed: StoredAccount[] = createSeedAccounts(),
  ) {
    this.accounts = [...seed];
  }

  async list(page: PageRequest): Promise<Page<Account>> {
    const net = await this.netByAccount();
    const rows = this.accounts.map((account) => ({ ...account, balance: account.openingBalance + (net.get(account.id) ?? 0) }));
    const start = page.cursor ? Number(page.cursor) : 0;
    const end = start + page.limit;
    return { items: rows.slice(start, end), nextCursor: end < rows.length ? String(end) : null };
  }

  async create(input: NewAccount): Promise<Account> {
    if (this.accounts.some((account) => account.name.toLowerCase() === input.name.toLowerCase())) {
      throw new ValidationError(`Akun ${input.name} sudah ada`, "name");
    }
    const account = { ...input, id: `acc_${crypto.randomUUID()}` };
    this.accounts.push(account);
    return { ...account, balance: account.openingBalance };
  }
}

/** Akun contoh untuk mode mock. */
export function createSeedAccounts(): StoredAccount[] {
  return [
    { id: "cash", name: "Tunai", kind: "cash", openingBalance: 500_000 },
    { id: "bank", name: "Rekening bank", kind: "bank", openingBalance: 2_000_000 },
  ];
}
