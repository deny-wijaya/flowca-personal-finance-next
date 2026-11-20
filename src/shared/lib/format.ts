/**
 * Format tampilan untuk bahasa Indonesia. Dipanggil dari mapper view model,
 * bukan dari JSX, supaya screen hanya menerima string yang sudah jadi.
 */

const numberFormatter = new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 });

const DAY_SHORT = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"] as const;
const DAY_LONG = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"] as const;
const MONTH_SHORT = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"] as const;
const MONTH_LONG = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
] as const;

/** Tanda minus tipografis (U+2212), sesuai desain. */
export const MINUS = "−";

/** 12500 -> "12.500" */
export function formatThousands(amount: number) {
  return numberFormatter.format(Math.round(amount));
}

/** -25000 -> "Rp 25.000" (selalu nilai absolut) */
export function formatRupiah(amount: number) {
  return `Rp ${formatThousands(Math.abs(amount))}`;
}

/** -25000 -> "−Rp 25.000", 6500000 -> "+Rp 6.500.000" */
export function signedAmount(amount: number) {
  return `${amount < 0 ? MINUS : "+"}${formatRupiah(amount)}`;
}

/** Seperti signedAmount, tapi nol dan positif tanpa tanda plus: "Rp 7.052.500", "−Rp 40.000". */
export function netAmount(amount: number) {
  return `${amount < 0 ? MINUS : ""}${formatRupiah(amount)}`;
}

/** Date -> "12.30" */
export function formatTime(date: Date) {
  return `${String(date.getHours()).padStart(2, "0")}.${String(date.getMinutes()).padStart(2, "0")}`;
}

/** Date -> "Kam, 19 Nov" */
export function formatShortDay(date: Date) {
  return `${DAY_SHORT[date.getDay()]}, ${date.getDate()} ${MONTH_SHORT[date.getMonth()]}`;
}

/** Date -> "19 Nov 2026" */
export function formatDate(date: Date) {
  return `${date.getDate()} ${MONTH_SHORT[date.getMonth()]} ${date.getFullYear()}`;
}

/** Date -> "Kamis, 19 November 2026" */
export function formatLongDate(date: Date) {
  return `${DAY_LONG[date.getDay()]}, ${date.getDate()} ${MONTH_LONG[date.getMonth()]} ${date.getFullYear()}`;
}

/** (2026, 11) -> "November 2026" */
export function formatMonthYear(year: number, month: number) {
  return `${MONTH_LONG[month - 1]} ${year}`;
}

/** (2026, 11) -> "Nov 2026" */
export function formatShortMonthYear(year: number, month: number) {
  return `${MONTH_SHORT[month - 1]} ${year}`;
}

/** 11 -> "Nov" */
export function formatShortMonth(month: number) {
  return MONTH_SHORT[month - 1];
}

/** Selisih hari kalender antara dua tanggal (b - a), mengabaikan jam. */
export function calendarDayDiff(a: Date, b: Date) {
  const start = new Date(a.getFullYear(), a.getMonth(), a.getDate());
  const end = new Date(b.getFullYear(), b.getMonth(), b.getDate());
  return Math.round((end.getTime() - start.getTime()) / 86_400_000);
}

/** "Hari ini", "Kemarin", atau undefined untuk tanggal lain. */
export function relativeDayName(date: Date, now: Date) {
  const diff = calendarDayDiff(date, now);
  if (diff === 0) return "Hari ini";
  if (diff === 1) return "Kemarin";
  return undefined;
}

/** Date -> "2026-11-13" (format untuk <input type="date">) */
export function toDateInputValue(date: Date) {
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 10);
}

/** Date -> "12:30" (format untuk <input type="time">) */
export function toTimeInputValue(date: Date) {
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

/** "2.500.000" atau "2500000" -> 2500000; string kosong -> 0 */
export function parseThousands(input: string) {
  const digits = input.replace(/\D/g, "");
  return digits ? Number(digits) : 0;
}

/** Ketikan pengguna -> "2.500.000" (maks 13 digit), dipakai input nominal. */
export function formatThousandsInput(input: string) {
  const digits = input.replace(/\D/g, "").slice(0, 13);
  return digits ? formatThousands(Number(digits)) : "";
}

/** "Rani Putri" -> "RP" */
export function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return parts
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}
