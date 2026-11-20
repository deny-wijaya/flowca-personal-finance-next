import Link from "next/link";
import { cn } from "@/shared/lib/cn";
import { Badge } from "@/shared/ui/primitives/badge";
import { CategoryTile } from "@/shared/ui/primitives/category-tile";
import { PixelProgress } from "@/shared/ui/primitives/pixel-progress";
import type { BudgetRowVM } from "../view-models/budget-view-model";

/** Kartu anggaran satu kategori (layar Anggaran mobile). Status & catatan sudah dihitung di mapper. */
export function BudgetCard({ row, href }: { row: BudgetRowVM; href: string }) {
  return (
    <Link href={href} className="flex flex-col gap-2 rounded-xl border-3 border-ink bg-paper p-3 text-ink no-underline shadow-hard-2 hover:bg-orange-50 hover:text-ink">
      <span className="flex items-center gap-2.5">
        <CategoryTile initial={row.initial} tone={row.tone} size={36} />
        <span className="flex min-w-0 flex-1 flex-col gap-px">
          <span className="text-15 font-bold">{row.category}</span>
          <span className="fc-num text-12 text-ink-600">{row.detail}</span>
        </span>
        <Badge tone={row.status} size="md">
          {row.badge}
        </Badge>
      </span>
      <PixelProgress segments={10} filled={row.filled10} tone={row.status} />
      <span className={cn("text-12 font-semibold", row.noteTone === "danger" ? "text-danger" : "text-ink-600")}>{row.note}</span>
    </Link>
  );
}

/** Baris ringkas (kartu Anggaran di beranda desktop). */
export function BudgetLine({ row }: { row: BudgetRowVM }) {
  return (
    <li className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between gap-2">
        <span className="text-14 font-bold">{row.category}</span>
        <span className="flex items-center gap-2">
          <span className="fc-num text-13 text-ink-600">{row.compactDetail}</span>
          <Badge tone={row.status}>{row.badge}</Badge>
        </span>
      </div>
      <PixelProgress segments={20} filled={row.filled20} tone={row.status} />
    </li>
  );
}
