import Link from "next/link";
import { cn } from "@/shared/lib/cn";
import { Icon } from "../primitives/icon";

type MonthSwitcherProps = {
  label: string;
  prevHref: string;
  /** Tanpa nextHref, tombol berikutnya nonaktif (bulan depan belum terjadi). */
  nextHref?: string;
  size?: "sm" | "md";
  className?: string;
};

/** Pemilih bulan ‹ November 2026 ›. Navigasi lewat query `?month=YYYY-MM`. */
export function MonthSwitcher({ label, prevHref, nextHref, size = "sm", className }: MonthSwitcherProps) {
  const buttonClass = cn("flex items-center justify-center text-ink hover:text-ink", size === "sm" ? "size-10" : "h-10.5 w-11");
  return (
    <div className={cn("flex flex-none items-center rounded-lg border-3 border-ink bg-paper shadow-hard-1", className)}>
      <Link href={prevHref} aria-label="Bulan sebelumnya" className={buttonClass}>
        <Icon name="chevron-left" size={16} strokeWidth={3.2} />
      </Link>
      <span className={cn("text-14 font-bold", size === "sm" && "px-0.5")}>{label}</span>
      {nextHref ? (
        <Link href={nextHref} aria-label="Bulan berikutnya" className={buttonClass}>
          <Icon name="chevron-right" size={16} strokeWidth={3.2} />
        </Link>
      ) : (
        <span aria-disabled="true" aria-label="Bulan berikutnya (belum tersedia)" role="link" className={cn(buttonClass, "cursor-not-allowed opacity-40")}>
          <Icon name="chevron-right" size={16} strokeWidth={3.2} />
        </span>
      )}
    </div>
  );
}
