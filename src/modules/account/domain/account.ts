import type { Page, PageRequest } from "@/shared/domain/pagination";

/** Tempat uang disimpan (tunai, rekening bank, e-wallet, kartu kredit). */
export const ACCOUNT_KINDS = ["cash", "bank", "ewallet", "credit"] as const;
export type AccountKind = (typeof ACCOUNT_KINDS)[number];

/** Akun dari GET /accounts (API-CONTRACT.md bagian 4.8). */
export type Account = {
  id: string;
  name: string;
  kind: AccountKind;
  /** Saldo saat akun mulai dicatat. Tidak berubah oleh transaksi. */
  openingBalance: number;
  /** Saldo saat ini: saldo awal + pemasukan − pengeluaran, dihitung backend. Boleh negatif. */
  balance: number;
};

export type NewAccount = Pick<Account, "name" | "kind" | "openingBalance">;

export const MAX_ACCOUNT_NAME_LENGTH = 40;

/** Port penyimpanan akun. Implementasinya HTTP (GET/POST /accounts) dan in-memory (mock). */
export interface AccountRepository {
  /** Akun milik user yang login beserta saldonya, satu halaman, urut dari yang paling lama dibuat. */
  list(page: PageRequest): Promise<Page<Account>>;
  /** Melempar ValidationError di field "name" kalau nama sudah dipakai. */
  create(input: NewAccount): Promise<Account>;
}
