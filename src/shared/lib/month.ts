/** Bulan yang sedang dilihat, dibaca dari query `?month=2026-11`. */
export type MonthRef = { year: number; month: number };

/** "2026-11" -> { year: 2026, month: 11 }; nilai tidak valid -> bulan dari `now`. */
export function parseMonthParam(value: string | string[] | undefined, now: Date = new Date()): MonthRef {
  const raw = Array.isArray(value) ? value[0] : value;
  const match = raw?.match(/^(\d{4})-(\d{2})$/);
  if (match) {
    const year = Number(match[1]);
    const month = Number(match[2]);
    if (month >= 1 && month <= 12) return { year, month };
  }
  return { year: now.getFullYear(), month: now.getMonth() + 1 };
}

/** { 2026, 11 } -> "2026-11" */
export function toMonthParam({ year, month }: MonthRef) {
  return `${year}-${String(month).padStart(2, "0")}`;
}

export function shiftMonth({ year, month }: MonthRef, delta: number): MonthRef {
  const date = new Date(year, month - 1 + delta, 1);
  return { year: date.getFullYear(), month: date.getMonth() + 1 };
}

export function monthRange({ year, month }: MonthRef) {
  return { from: new Date(year, month - 1, 1), to: new Date(year, month, 0, 23, 59, 59, 999) };
}

export function isSameMonth(a: MonthRef, b: MonthRef) {
  return a.year === b.year && a.month === b.month;
}
