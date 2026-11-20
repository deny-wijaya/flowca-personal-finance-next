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
import { isSameMonth, shiftMonth, toMonthParam, type MonthRef } from "@/shared/lib/month";
import type { Transaction } from "../../domain/transaction";
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
    relativeDay: relativeDayName(trx.occurredAt, now) ?? formatShortDay(trx.occurredAt),
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

/** Kelompokkan transaksi (sudah terurut terbaru di atas) per hari kalender. */
export function groupByDay(transactions: Transaction[], ctx: TransactionContext): DayGroupVM[] {
  const groups: { key: string; date: Date; total: number; rows: DayGroupVM["rows"] }[] = [];
  for (const trx of transactions) {
    const key = formatDate(trx.occurredAt);
    let group = groups.at(-1);
    if (!group || group.key !== key) {
      group = { key, date: trx.occurredAt, total: 0, rows: [] };
      groups.push(group);
    }
    const row = toTransactionRow(trx, ctx);
    group.total += row.sortAmount;
    group.rows.push({ ...row, meta: rowMetaWithTime(row) });
  }
  return groups.map((group) => {
    const relative = relativeDayName(group.date, ctx.now);
    const day = formatShortDay(group.date);
    return { key: group.key, label: relative ? `${relative} · ${day}` : day, sum: signedAmount(group.total), rows: group.rows };
  });
}

export type SummaryStripVM = { totalIn: string; totalOut: string; net: string };

export function toSummaryStrip(transactions: Transaction[]): SummaryStripVM {
  let income = 0;
  let expense = 0;
  for (const trx of transactions) {
    if (trx.type === "income") income += trx.amount;
    else expense += trx.amount;
  }
  return { totalIn: formatRupiah(income), totalOut: formatRupiah(expense), net: netAmount(income - expense) };
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

/** Filter klien: jenis + kata kunci di nama/kategori (tidak peka huruf besar). */
export function matchesFilter(row: Pick<TransactionRowVM, "name" | "category" | "direction">, filter: { type: TypeFilter; query: string }) {
  if (filter.type !== "all" && row.direction !== filter.type) return false;
  const query = filter.query.trim().toLowerCase();
  return !query || `${row.name} ${row.category}`.toLowerCase().includes(query);
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
