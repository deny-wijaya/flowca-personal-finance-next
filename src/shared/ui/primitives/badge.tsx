import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";
import { cn } from "@/shared/lib/cn";

/** Label kecil berbingkai. Teks selalu ada, warna bukan satu-satunya penanda. */
export const badgeVariants = cva("inline-flex items-center rounded-xs border-2 border-ink text-11 font-bold whitespace-nowrap text-ink", {
  variants: {
    tone: {
      safe: "bg-cyan-100",
      warn: "bg-orange",
      over: "bg-coral",
      ai: "bg-pink font-display",
      neutral: "bg-field",
    },
    size: { sm: "px-1.5", md: "px-1.5 py-0.5" },
  },
  defaultVariants: { tone: "neutral", size: "sm" },
});

export function Badge({ tone, size, className, ...props }: ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ tone, size }), className)} {...props} />;
}
