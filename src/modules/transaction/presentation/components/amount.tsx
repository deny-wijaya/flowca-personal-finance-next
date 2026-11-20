import { cva } from "class-variance-authority";
import { cn } from "@/shared/lib/cn";
import type { Direction } from "../view-models/transaction-view-model";

export const amountVariants = cva("fc-num font-bold whitespace-nowrap", {
  variants: {
    direction: { in: "text-income", out: "text-danger", neutral: "text-ink" },
    size: { 14: "text-14", 15: "text-15", 22: "text-22", 28: "text-28" },
  },
  defaultVariants: { direction: "neutral", size: 14 },
});

/** Nominal bertanda; warnanya dari `direction` yang dihitung di mapper. */
export function Amount({ value, direction, size = 14, className }: { value: string; direction?: Direction | "neutral"; size?: 14 | 15 | 22 | 28; className?: string }) {
  return <span className={cn(amountVariants({ direction, size }), className)}>{value}</span>;
}
