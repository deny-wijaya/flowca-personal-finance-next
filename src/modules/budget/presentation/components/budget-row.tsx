import { Badge } from "@/shared/ui/primitives/badge";
import { PixelProgress } from "@/shared/ui/primitives/pixel-progress";
import type { BudgetRowVM } from "../view-models/budget-view-model";

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
