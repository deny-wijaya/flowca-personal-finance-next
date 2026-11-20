import { cva, type VariantProps } from "class-variance-authority";
import Link from "next/link";
import type { ComponentProps } from "react";
import { cn } from "@/shared/lib/cn";

/**
 * Tombol kotak berisi ikon saja. `aria-label` wajib lewat tipe props,
 * karena ikon tidak punya teks yang bisa dibaca pembaca layar.
 */
export const iconButtonVariants = cva(
  "inline-flex flex-none items-center justify-center rounded-lg border-ink text-ink hover:text-ink",
  {
    variants: {
      size: { 40: "size-10", 44: "size-11", 48: "size-12", 52: "h-12 w-13" },
      tone: {
        paper: "bg-paper",
        orange: "bg-orange",
        coral: "bg-coral",
        ghost: "bg-transparent",
      },
      border: { none: "border-0", thin: "border-2", thick: "border-3" },
      elevation: { none: "", 1: "fc-press shadow-hard-1" },
      radius: { lg: "rounded-lg", xl: "rounded-xl" },
    },
    defaultVariants: { size: 44, tone: "paper", border: "thick", elevation: "none", radius: "lg" },
  },
);

type IconButtonVariants = VariantProps<typeof iconButtonVariants>;
type Labelled = { "aria-label": string };

export function IconButton({
  size,
  tone,
  border,
  elevation,
  radius,
  className,
  type = "button",
  ...props
}: ComponentProps<"button"> & IconButtonVariants & Labelled) {
  return <button type={type} className={cn(iconButtonVariants({ size, tone, border, elevation, radius }), "cursor-pointer", className)} {...props} />;
}

export function IconLink({
  size,
  tone,
  border,
  elevation,
  radius,
  className,
  ...props
}: ComponentProps<typeof Link> & IconButtonVariants & Labelled) {
  return <Link className={cn(iconButtonVariants({ size, tone, border, elevation, radius }), className)} {...props} />;
}
