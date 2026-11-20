import { cva, type VariantProps } from "class-variance-authority";

/**
 * Tombol retro: border tinta 3px, radius 10px, bayangan keras.
 * Hover/press lewat `.fc-press` (base.css). Varian hanya mengatur warna dan ukuran.
 */
export const buttonVariants = cva(
  "fc-press inline-flex flex-none items-center justify-center gap-2.5 rounded-lg border-3 border-ink font-bold whitespace-nowrap text-ink no-underline hover:text-ink",
  {
    variants: {
      tone: {
        coral: "bg-coral",
        orange: "bg-orange",
        cyan: "bg-cyan",
        pink: "bg-pink",
        paper: "bg-paper",
        white: "bg-field",
      },
      /** Tinggi dalam px, sesuai nilai di desain. */
      size: {
        40: "h-10 px-3.5",
        42: "h-10.5 px-3.5",
        44: "h-11 px-3.5",
        46: "h-11.5 px-4",
        48: "h-12 px-4",
        50: "h-12.5 px-4",
        52: "h-13 px-4",
        54: "h-13.5 px-5",
        56: "h-14 px-5",
      },
      font: {
        display: "font-display text-20",
        "display-lg": "font-display text-22",
        body: "font-body text-16",
        "body-sm": "font-body text-15",
        "body-xs": "font-body text-14",
      },
      elevation: { 1: "shadow-hard-1", 2: "shadow-hard-2" },
      block: { true: "w-full" },
    },
    defaultVariants: { tone: "coral", size: 54, font: "display", elevation: 2 },
  },
);

export type ButtonVariants = VariantProps<typeof buttonVariants>;
