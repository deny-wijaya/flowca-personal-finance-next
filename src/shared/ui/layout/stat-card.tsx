import { cva, type VariantProps } from "class-variance-authority";
import type { ReactNode } from "react";
import { cn } from "@/shared/lib/cn";

/** Kartu angka ringkasan (saldo, masuk, keluar, sisa anggaran). */
const statCardVariants = cva("flex flex-col border-3 border-ink text-ink", {
  variants: {
    tone: { paper: "bg-paper", cyan: "bg-cyan", pink: "bg-pink" },
    size: {
      hero: "gap-1.5 rounded-2xl p-4.5 shadow-hard-4",
      compact: "gap-1 rounded-xl p-3",
      desktop: "gap-1.5 rounded-2xl px-4.5 py-4 shadow-hard-3",
    },
  },
  defaultVariants: { tone: "paper", size: "desktop" },
});

const valueVariants = cva("fc-num font-bold", {
  variants: { size: { hero: "text-34", compact: "text-20", desktop: "text-28" } },
  defaultVariants: { size: "desktop" },
});

const dotVariants = cva("inline-block size-2.5 flex-none border-2 border-ink", {
  variants: { dot: { cyan: "bg-cyan", coral: "bg-coral" } },
});

type StatCardProps = VariantProps<typeof statCardVariants> & {
  label: string;
  value: string;
  caption?: ReactNode;
  dot?: "cyan" | "coral";
  as?: "div" | "section";
  ariaLabel?: string;
  className?: string;
};

export function StatCard({ label, value, caption, dot, tone, size, as: Component = "div", ariaLabel, className }: StatCardProps) {
  return (
    <Component aria-label={ariaLabel} className={cn(statCardVariants({ tone, size }), className)}>
      <div className={cn("flex items-center gap-1.5 font-bold", size === "compact" ? "text-12" : "text-13")}>
        {dot && <span aria-hidden="true" className={dotVariants({ dot })} />}
        {label}
      </div>
      <div className={valueVariants({ size })}>{value}</div>
      {caption && <div className={cn("text-13", size === "desktop" && "text-ink-700")}>{caption}</div>}
    </Component>
  );
}
