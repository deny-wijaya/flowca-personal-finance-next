/** Tempat uang disimpan (tunai, rekening bank, e-wallet, kartu kredit). */
export const ACCOUNT_KINDS = ["cash", "bank", "ewallet", "credit"] as const;
export type AccountKind = (typeof ACCOUNT_KINDS)[number];

export type Account = {
  id: string;
  name: string;
  kind: AccountKind;
  /** Saldo saat akun mulai dicatat, dalam Rupiah. */
  openingBalance: number;
};

/** Port penyimpanan akun. */
export interface AccountRepository {
  list(): Promise<Account[]>;
}
