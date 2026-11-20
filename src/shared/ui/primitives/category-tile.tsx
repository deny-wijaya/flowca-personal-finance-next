import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/shared/lib/cn";

/**
 * Kotak huruf awal kategori. Warna dari `tone` (lihat `categoryTone` di modul transaksi).
 * Ini satu-satunya tempat Pixelify dipakai di bawah 20px (huruf tunggal).
 */
export const categoryTileVariants = cva("flex flex-none items-center justify-center border-2 border-ink font-display font-bold text-ink", {
  variants: {
    tone: {
      orange: "bg-orange-100",
      cyan: "bg-cyan-100",
      pink: "bg-pink-100",
      coral: "bg-coral-100",
      lilac: "bg-lilac-100",
      green: "bg-green-100",
      sand: "bg-sand-100",
      paper: "bg-paper",
    },
    size: {
      18: "size-4.5 rounded-xs text-11",
      30: "size-7.5 rounded-sm text-15",
      34: "size-8.5 rounded-md text-16",
      36: "size-9 rounded-md text-16",
      38: "size-9.5 rounded-md text-16",
      40: "size-10 rounded-lg text-18",
      44: "size-11 rounded-lg text-18",
    },
  },
  defaultVariants: { tone: "sand", size: 40 },
});

export type CategoryTileTone = NonNullable<VariantProps<typeof categoryTileVariants>["tone"]>;

export function CategoryTile({ initial, tone, size, className }: { initial: string; className?: string } & VariantProps<typeof categoryTileVariants>) {
  return (
    <span aria-hidden="true" className={cn(categoryTileVariants({ tone, size }), className)}>
      {initial}
    </span>
  );
}

/** Pill kategori (tabel desktop): latar tint sama dengan tile. */
export const categoryPillVariants = cva("inline-flex items-center gap-1.5 rounded-full border-2 border-ink py-0.5 pr-2.5 pl-1 text-13 font-bold text-ink", {
  variants: {
    tone: {
      orange: "bg-orange-100",
      cyan: "bg-cyan-100",
      pink: "bg-pink-100",
      coral: "bg-coral-100",
      lilac: "bg-lilac-100",
      green: "bg-green-100",
      sand: "bg-sand-100",
      paper: "bg-paper",
    },
  },
  defaultVariants: { tone: "sand" },
});
