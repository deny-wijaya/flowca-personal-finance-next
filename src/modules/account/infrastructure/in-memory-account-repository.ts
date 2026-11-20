import type { Account, AccountRepository } from "../domain/account";

/** Akun contoh untuk mode mock. Backend belum punya endpoint akun. */
export class InMemoryAccountRepository implements AccountRepository {
  constructor(private readonly accounts: Account[] = createSeedAccounts()) {}

  async list(): Promise<Account[]> {
    return [...this.accounts];
  }
}

export function createSeedAccounts(): Account[] {
  return [
    { id: "cash", name: "Tunai", kind: "cash", openingBalance: 500_000 },
    { id: "bank", name: "Rekening bank", kind: "bank", openingBalance: 2_000_000 },
  ];
}
