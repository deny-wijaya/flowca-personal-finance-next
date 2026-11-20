import type { ComponentProps } from "react";
import { cn } from "@/shared/lib/cn";
import { chipVariants, type ChipVariants } from "./chip.variants";

type ChipProps = Omit<ComponentProps<"button">, "role"> &
  ChipVariants & {
    /**
     * "radio" untuk pilihan tunggal di dalam `role="radiogroup"` (aria-checked),
     * "toggle" untuk pilihan yang bisa dinyalakan/dimatikan (aria-pressed).
     */
    behavior?: "radio" | "toggle" | "action";
  };

export function Chip({ shape, selected, activeTone, behavior = "toggle", className, type = "button", ...props }: ChipProps) {
  const a11y =
    behavior === "radio"
      ? { role: "radio" as const, "aria-checked": Boolean(selected) }
      : behavior === "toggle"
        ? { "aria-pressed": Boolean(selected) }
        : {};

  return <button type={type} className={cn(chipVariants({ shape, selected, activeTone }), className)} {...a11y} {...props} />;
}
