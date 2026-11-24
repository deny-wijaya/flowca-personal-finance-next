import { formatRupiah } from "@/shared/lib/format";
import type { AccountBalances } from "../../application/get-account-balances";
import type { AccountKind } from "../../domain/account";

export const ACCOUNT_KIND_OPTIONS: { id: AccountKind; label: string }[] = [
  { id: "cash", label: "Tunai" },
  { id: "bank", label: "Rekening bank" },
  { id: "ewallet", label: "E-wallet" },
  { id: "credit", label: "Kartu kredit" },
];

export function accountKindLabel(kind: AccountKind) {
  return ACCOUNT_KIND_OPTIONS.find((option) => option.id === kind)?.label ?? kind;
}

/** Rupiah dengan tanda minus untuk saldo negatif: "−Rp 250.000". */
function formatBalance(amount: number) {
  return `${amount < 0 ? "−" : ""}${formatRupiah(Math.abs(amount))}`;
}

export type AccountRowVM = {
  id: string;
  name: string;
  /** "Rekening bank" */
  kindLabel: string;
  initial: string;
  /** "Rp 13.000.000" atau "−Rp 250.000" */
  balance: string;
  negative: boolean;
  /** "Saldo awal Rp 2.000.000" */
  caption: string;
};

export type AccountsScreenVM = {
  /** Jumlah saldo semua akun. */
  total: string;
  /** "2 akun" */
  subtitle: string;
  rows: AccountRowVM[];
};

export function toAccountsScreenVM({ accounts, total }: AccountBalances): AccountsScreenVM {
  return {
    total: formatBalance(total),
    subtitle: `${accounts.length} akun`,
    rows: accounts.map((account) => ({
      id: account.id,
      name: account.name,
      kindLabel: accountKindLabel(account.kind),
      initial: account.name.charAt(0).toUpperCase(),
      balance: formatBalance(account.balance),
      negative: account.balance < 0,
      caption: `Saldo awal ${formatBalance(account.openingBalance)}`,
    })),
  };
}
