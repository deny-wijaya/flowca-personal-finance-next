const currencyFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

const dateFormatter = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

/** 12500000 -> "Rp 12.500.000" */
export function formatCurrency(amount: number) {
  return currencyFormatter.format(amount);
}

/** Date -> "13 Nov 2026" */
export function formatDate(date: Date) {
  return dateFormatter.format(date);
}

/** Date -> "2026-11-13" (format untuk <input type="date">) */
export function toDateInputValue(date: Date) {
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 10);
}
