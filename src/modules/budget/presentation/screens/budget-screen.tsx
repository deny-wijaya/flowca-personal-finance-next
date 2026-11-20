import Link from "next/link";
import { ButtonLink } from "@/shared/ui/primitives/button";
import { Card } from "@/shared/ui/primitives/card";
import { Icon } from "@/shared/ui/primitives/icon";
import { PixelProgress } from "@/shared/ui/primitives/pixel-progress";
import { BudgetCard } from "../components/budget-row";
import type { BudgetScreenVM } from "../view-models/budget-view-model";

/** Layar Anggaran (desain mobile; di desktop tampil di kolom yang sama, belum ada desain khusus). */
export function BudgetScreen({ vm }: { vm: BudgetScreenVM }) {
  return (
    <div className="mx-auto flex w-full max-w-160 flex-col lg:pt-4">
      <header className="flex items-center justify-between gap-3 px-5 pt-4 pb-2.5">
        <div className="flex flex-col gap-0.5">
          <h1 className="m-0 font-display text-28 font-bold">Anggaran</h1>
          <div className="text-13 font-semibold text-ink-600">{vm.subtitle}</div>
        </div>
        {/* TODO(budget): layar atur batas anggaran belum didesain. */}
        <ButtonLink href="/budget#atur" tone="paper" size={44} font="body-xs" elevation={1} className="gap-1.5">
          <Icon name="pencil" size={16} />
          <span>Atur</span>
        </ButtonLink>
      </header>

      <div className="flex flex-col gap-4 px-5 pt-1.5 pb-5">
        <Card as="section" aria-label="Sisa anggaran" tone="pink" className="flex flex-col gap-2.5 p-4.5">
          <div className="text-13 font-bold">Sisa anggaran bulan ini</div>
          <div className="fc-num text-34 leading-none font-bold">{vm.remaining}</div>
          <PixelProgress size="lg" segments={20} filled={vm.totalFilled} tone="ink" label="Anggaran terpakai" valueNow={vm.usedPercent} />
          <div className="flex justify-between text-13 font-semibold">
            <span>Terpakai {vm.spent}</span>
            <span>dari {vm.limit}</span>
          </div>
          <div className="rounded-md border-2 border-ink bg-paper px-2.5 py-2 text-13">
            Aman dipakai sekitar <strong>{vm.perDay}</strong> per hari sampai akhir bulan.
          </div>
        </Card>

        <div className="flex items-center justify-between">
          <h2 className="m-0 font-display text-20 font-bold">Per kategori</h2>
          <span className="text-12 font-bold text-ink-600">{vm.categoryCount} kategori</span>
        </div>
        <ul className="m-0 flex list-none flex-col gap-2.5 p-0">
          {vm.rows.map((row) => (
            <li key={row.category}>
              <BudgetCard row={row} href="/transactions" />
            </li>
          ))}
        </ul>
        <Link
          href="/budget#tambah-kategori"
          className="fc-press flex h-12.5 items-center justify-center gap-2 rounded-xl border-3 border-dashed border-ink bg-transparent font-bold text-ink no-underline hover:text-ink"
        >
          <Icon name="plus" size={16} />
          <span>Tambah anggaran kategori</span>
        </Link>
      </div>
    </div>
  );
}
