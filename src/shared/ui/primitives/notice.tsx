import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";
import { cn } from "@/shared/lib/cn";

/** Kotak pesan kecil berbingkai tinta (sukses, error, info, catatan). */
export const noticeVariants = cva("rounded-md border-2 border-ink text-ink", {
  variants: {
    tone: {
      success: "bg-green-50",
      error: "bg-coral-50 text-danger-strong",
      info: "bg-cyan-50",
      note: "bg-orange-50",
      paper: "bg-paper",
    },
    size: { sm: "px-2.5 py-2 text-13", md: "px-3 py-2 text-14", lg: "px-3 py-2.5 text-14" },
  },
  defaultVariants: { tone: "info", size: "sm" },
});

type NoticeProps = ComponentProps<"div"> &
  VariantProps<typeof noticeVariants> & {
    /** Error memakai role="alert" (langsung dibacakan); lainnya role="status". */
    live?: boolean;
  };

export function Notice({ tone, size, live = true, className, ...props }: NoticeProps) {
  const role = live ? (tone === "error" ? "alert" : "status") : undefined;
  return <div role={role} className={cn(noticeVariants({ tone, size }), className)} {...props} />;
}
