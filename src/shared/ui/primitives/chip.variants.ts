import { cva, type VariantProps } from "class-variance-authority";

/**
 * Chip pilihan.
 * - pill: filter/akun (terpilih = latar tinta, teks krem)
 * - tile: kategori bergrid (terpilih = orange-100, border 3px)
 * - segment: tab di dalam segmented control (warna aktif dari `activeTone`)
 * - suggestion: saran teks di Catat cepat (hover orange-100)
 */
export const chipVariants = cva("inline-flex cursor-pointer items-center justify-center font-body font-bold text-ink", {
  variants: {
    shape: {
      pill: "min-h-10 rounded-full border-2 border-ink px-3.5 text-14",
      tile: "min-h-18 flex-col gap-1 rounded-lg border-ink px-0.5 py-1.5",
      segment: "h-10 rounded-md border-0 text-14",
      suggestion: "min-h-10 flex-none gap-1.5 rounded-full border-2 border-ink bg-paper px-3 text-13 hover:bg-orange-100",
    },
    selected: { true: "", false: "" },
    activeTone: { ink: "", coral: "", cyan: "", pink: "" },
  },
  compoundVariants: [
    { shape: "pill", selected: true, className: "bg-ink text-cream" },
    { shape: "pill", selected: false, className: "bg-paper" },
    { shape: "tile", selected: true, className: "border-3 bg-orange-100" },
    { shape: "tile", selected: false, className: "border-2 bg-paper" },
    { shape: "segment", selected: false, className: "bg-transparent" },
    { shape: "segment", selected: true, activeTone: "coral", className: "bg-coral" },
    { shape: "segment", selected: true, activeTone: "cyan", className: "bg-cyan" },
    { shape: "segment", selected: true, activeTone: "pink", className: "bg-pink" },
    { shape: "segment", selected: true, activeTone: "ink", className: "bg-ink text-cream" },
  ],
  defaultVariants: { shape: "pill", selected: false, activeTone: "ink" },
});

export type ChipVariants = VariantProps<typeof chipVariants>;
