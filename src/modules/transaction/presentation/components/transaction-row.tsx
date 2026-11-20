import Link from "next/link";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/shared/lib/cn";
import { CategoryTile } from "@/shared/ui/primitives/category-tile";
import type { TransactionRowVM } from "../view-models/transaction-view-model";
import { Amount } from "./amount";

const rowVariants = cva("flex items-center bg-paper text-ink no-underline hover:bg-orange-50 hover:text-ink", {
  variants: {
    density: {
      mobile: "gap-3 px-3 py-2.5",
      roomy: "gap-3 px-3.5 py-3",
      desktop: "gap-3 px-4 py-2.5",
    },
  },
  defaultVariants: { density: "mobile" },
});

type TransactionRowProps = VariantProps<typeof rowVariants> & {
  row: Pick<TransactionRowVM, "name" | "initial" | "tone" | "amount" | "direction">;
  meta: string;
  href: string;
  tileSize?: 38 | 40;
};

/** Baris transaksi: tile kategori, nama, meta, nominal bertanda. */
export function TransactionRow({ row, meta, href, density, tileSize = 40 }: TransactionRowProps) {
  const roomy = density === "roomy";
  return (
    <Link href={href} className={rowVariants({ density })}>
      <CategoryTile initial={row.initial} tone={row.tone} size={roomy ? 44 : tileSize} />
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className={cn("truncate font-bold", density === "desktop" ? "text-14" : "text-15")}>{row.name}</span>
        <span className="text-12 text-ink-600">{meta}</span>
      </span>
      <Amount value={row.amount} direction={row.direction} size={roomy ? 15 : 14} />
    </Link>
  );
}

/** Daftar baris dalam kartu, dipisah garis putus-putus. */
export function TransactionRowList({ children, className }: { children: React.ReactNode; className?: string }) {
  return <ul className={cn("m-0 list-none overflow-hidden p-0 [&>li+li]:border-t-2 [&>li+li]:border-dashed [&>li+li]:border-sand-200", className)}>{children}</ul>;
}
