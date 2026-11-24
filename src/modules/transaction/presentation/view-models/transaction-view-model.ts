import type { CategoryTileTone } from "@/shared/ui/primitives/category-tile";
import {
  formatDate,
  formatRupiah,
  formatShortDay,
  formatShortMonthYear,
  formatMonthYear,
  formatTime,
  netAmount,
  relativeDayName,
  signedAmount,
  calendarDayDiff,
} from "@/shared/lib/format";
import { isSameMonth, monthRange, parseMonthParam, shiftMonth, toMonthParam, type MonthRef } from "@/shared/lib/month";
import type { Category } from "../../domain/category";
import type { Transaction } from "../../domain/transaction";
import type { TransactionFilter, TransactionTotals } from "../../domain/transaction-repository";
import { categoryInitial, categoryTone } from "./category-tone";

export type Direction = "in" | "out";

/** Satu baris transaksi yang siap ditampilkan (semua teks sudah terformat). */
export type TransactionRowVM = {
  id: string;
  name: string;
  category: string;
  initial: string;
  tone: CategoryTileTone;
  account: string;
  /** "−Rp 25.000" / "+Rp 6.500.000" */
  amount: string;
  direction: Direction;
  /** "Kam, 19 Nov" */
  dayLabel: string;
  /** "12.30" */
  time: string;
  /** "Hari ini" / "Kemarin" / "Kam, 19 Nov" */
  relativeDay: string;
  /** Kunci hari kalender untuk mengelompokkan baris per hari, "2026-11-19". */
  dayKey: string;
  /** Judul grup hari di daftar mobile: "Hari ini · Kam, 19 Nov" atau "Sen, 16 Nov". */
  dayGroupLabel: string;
  /** Nilai mentah untuk urut/filter di tabel interaktif. */
  sortTime: number;
  sortAmount: number;
};

export type TransactionContext = {
  now: Date;
  /** id akun -> nama akun ("cash" -> "Tunai"). */
  accountNames: ReadonlyMap<string, string>;
};

export function toTransactionRow(trx: Transaction, { now, accountNames }: TransactionContext): TransactionRowVM {
  const signed = trx.type === "income" ? trx.amount : -trx.amount;
  const relative = relativeDayName(trx.occurredAt, now);
  const day = formatShortDay(trx.occurredAt);
  return {
    id: trx.id,
    name: trx.note || trx.category,
    category: trx.category,
    initial: categoryInitial(trx.category),
    tone: categoryTone(trx.category),
    account: (trx.accountId && accountNames.get(trx.accountId)) || "Tanpa akun",
    amount: signedAmount(signed),
    direction: trx.type === "income" ? "in" : "out",
    dayLabel: formatShortDay(trx.occurredAt),
    time: formatTime(trx.occurredAt),
    relativeDay: relative ?? day,
    dayKey: formatDate(trx.occurredAt),
    dayGroupLabel: relative ? `${relative} · ${day}` : day,
    sortTime: trx.occurredAt.getTime(),
    sortAmount: signed,
  };
}

/** "Makanan · Tunai · 12.30" (daftar mobile per hari) */
export function rowMetaWithTime(row: TransactionRowVM) {
  return `${row.category} · ${row.account} · ${row.time}`;
}

/** "Makanan · Tunai · Hari ini, 12.30" (beranda mobile) */
export function rowMetaWithRelativeTime(row: TransactionRowVM) {
  return `${row.category} · ${row.account} · ${row.relativeDay}, ${row.time}`;
}

/** "Makanan · Tunai · Kam, 19 Nov" (beranda desktop) */
export function rowMetaWithDay(row: TransactionRowVM) {
  return `${row.category} · ${row.account} · ${row.dayLabel}`;
}

export type DayGroupVM = {
  key: string;
  /** "Hari ini · Kam, 19 Nov" */
  label: string;
  /** Jumlah bertanda untuk hari itu, "−Rp 47.000" */
  sum: string;
  rows: (TransactionRowVM & { meta: string })[];
};

/**
 * Kelompokkan baris (sudah terurut terbaru di atas) per hari kalender.
 * Bekerja dengan baris yang sudah terformat, jadi bisa dipanggil ulang di browser
 * setiap kali halaman berikutnya dimuat lewat tombol "Muat lebih banyak".
 */
export function groupRows(rows: TransactionRowVM[]): DayGroupVM[] {
  const groups: DayGroupVM[] = [];
  const totals: number[] = [];
  for (const row of rows) {
    let group = groups.at(-1);
    if (!group || group.key !== row.dayKey) {
      group = { key: row.dayKey, label: row.dayGroupLabel, sum: "", rows: [] };
      groups.push(group);
      totals.push(0);
    }
    totals[totals.length - 1] += row.sortAmount;
    group.rows.push({ ...row, meta: rowMetaWithTime(row) });
  }
  return groups.map((group, index) => ({ ...group, sum: signedAmount(totals[index]) }));
}

export type SummaryStripVM = { totalIn: string; totalOut: string; net: string };

/** Total dari GET /summary, bukan dari daftar transaksi yang baru dimuat sebagian. */
export function toSummaryStrip(totals: Pick<TransactionTotals, "totalIncome" | "totalExpense" | "netCashflow">): SummaryStripVM {
  return { totalIn: formatRupiah(totals.totalIncome), totalOut: formatRupiah(totals.totalExpense), net: netAmount(totals.netCashflow) };
}

export type MonthNavVM = {
  /** "November 2026" */
  label: string;
  /** "Nov 2026" */
  shortLabel: string;
  prevHref: string;
  /** undefined bila bulan berikutnya ada di masa depan. */
  nextHref?: string;
};

export function toMonthNav(pathname: string, current: MonthRef, now: Date): MonthNavVM {
  const prev = shiftMonth(current, -1);
  const next = shiftMonth(current, 1);
  const nowRef = { year: now.getFullYear(), month: now.getMonth() + 1 };
  const nextIsFuture = next.year > nowRef.year || (next.year === nowRef.year && next.month > nowRef.month);
  const href = (ref: MonthRef) => (isSameMonth(ref, nowRef) ? pathname : `${pathname}?month=${toMonthParam(ref)}`);
  return {
    label: formatMonthYear(current.year, current.month),
    shortLabel: formatShortMonthYear(current.year, current.month),
    prevHref: href(prev),
    nextHref: nextIsFuture ? undefined : href(next),
  };
}

/** Untuk teks "11 hari lagi menuju akhir bulan". */
export function daysUntilMonthEnd(now: Date) {
  return calendarDayDiff(now, new Date(now.getFullYear(), now.getMonth() + 1, 0));
}

export type TypeFilter = "all" | "out" | "in";

export const TYPE_FILTERS: { id: TypeFilter; label: string }[] = [
  { id: "all", label: "Semua" },
  { id: "out", label: "Pengeluaran" },
  { id: "in", label: "Pemasukan" },
];

/** Pilihan kategori untuk chip di form Tambah transaksi dan filter Kategori di menu Transaksi. */
export type CategoryOptionVM = { id: string; name: string; type: Category["type"] };

/** Kategori dari GET /categories menjadi pilihan siap tampil. */
export function toCategoryOptions(categories: Category[]): CategoryOptionVM[] {
  return categories.map(({ id, name, type }) => ({ id, name, type }));
}

/** Label pilihan filter Kategori. Nama "Lainnya" ada di kedua jenis, jadi jenisnya ikut ditulis. */
export function categoryOptionLabel(option: CategoryOptionVM) {
  return option.name === "Lainnya" ? `Lainnya (${option.type === "income" ? "pemasukan" : "pengeluaran"})` : option.name;
}

/**
 * Filter daftar di menu Transaksi. Disimpan di URL (`/transactions?month=2026-11&q=gojek&type=out`),
 * supaya backend yang mencari dan memfilter, dan filternya tetap ada saat halaman di-refresh.
 */
export type TransactionListFilters = {
  /** "2026-11" */
  month: string;
  /** Kata pencarian, "" kalau tidak mencari. */
  q: string;
  type: TypeFilter;
  /** Id kategori (misalnya "cat_expense_makanan"), "" untuk semua kategori. */
  category: string;
  /** Id akun, "" untuk semua akun. */
  account: string;
};

type SearchParamValue = string | string[] | undefined;

const MAX_QUERY_LENGTH = 100;

export function parseTransactionFilters(params: Record<string, SearchParamValue>, now: Date): TransactionListFilters {
  const first = (value: SearchParamValue) => (Array.isArray(value) ? value[0] : value) ?? "";
  const type = first(params.type);
  const category = first(params.category);
  const account = first(params.account);
  return {
    month: toMonthParam(parseMonthParam(params.month, now)),
    q: first(params.q).trim().slice(0, MAX_QUERY_LENGTH),
    type: type === "in" || type === "out" ? type : "all",
    // Id kategori tidak dicek di sini: id yang tidak dikenal hanya menghasilkan daftar kosong dari backend.
    category: category.slice(0, MAX_QUERY_LENGTH),
    account: account.slice(0, MAX_QUERY_LENGTH),
  };
}

/** true kalau ada filter selain bulan (untuk teks "Tidak ditemukan" dan footer tabel). */
export function hasActiveFilter(filters: TransactionListFilters) {
  return filters.q !== "" || filters.type !== "all" || filters.category !== "" || filters.account !== "";
}

/** Filter URL menjadi filter domain untuk use case ListTransactions. */
export function toTransactionFilter(filters: TransactionListFilters, now: Date): TransactionFilter {
  return {
    ...monthRange(parseMonthParam(filters.month, now)),
    type: filters.type === "all" ? undefined : filters.type === "in" ? "income" : "expense",
    categoryId: filters.category || undefined,
    accountId: filters.account || undefined,
    q: filters.q || undefined,
  };
}

/** URL menu Transaksi untuk filter tertentu. Nilai bawaan tidak ditulis supaya URL tetap pendek. */
export function transactionsHref(filters: TransactionListFilters) {
  const params = new URLSearchParams({ month: filters.month });
  if (filters.q) params.set("q", filters.q);
  if (filters.type !== "all") params.set("type", filters.type);
  if (filters.category) params.set("category", filters.category);
  if (filters.account) params.set("account", filters.account);
  return `/transactions?${params.toString()}`;
}

/** Total bertanda untuk sekumpulan baris (dipakai ulang setelah filter). */
export function formatRowsSum(rows: Pick<TransactionRowVM, "sortAmount">[]) {
  return signedAmount(rows.reduce((sum, row) => sum + row.sortAmount, 0));
}

/** Ringkasan setelah transaksi tersimpan: "Makanan · Tunai · 19 Nov 2026, 12.30 · “Makan siang”". */
export function formatSavedSummary(input: { category?: string; account: string; toAccount?: string; date: string; time: string; note?: string; transfer: boolean }) {
  const [year, month, day] = input.date.split("-").map(Number);
  const dateText = year ? formatDate(new Date(year, month - 1, day)) : "";
  const base = input.transfer
    ? `Transfer · ${input.account} → ${input.toAccount} · ${dateText}`
    : `${input.category} · ${input.account} · ${dateText}, ${input.time.replace(":", ".")}`;
  return input.note ? `${base} · “${input.note}”` : base;
}
