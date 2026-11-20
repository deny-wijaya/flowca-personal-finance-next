import { PrototypeBanner } from "@/shared/ui/layout/prototype-banner";
import { Icon } from "@/shared/ui/primitives/icon";
import { IconLink } from "@/shared/ui/primitives/icon-button";
import { Koko } from "@/shared/ui/primitives/koko";
import Link from "next/link";
import { QuickAddChat } from "../components/quick-add-chat";

/** Catat cepat versi halaman penuh (< 1024px). Di desktop rute ini membuka panel kanan di beranda. */
export function QuickAddScreen({ prototype, greeting }: { prototype: boolean; greeting: string }) {
  return (
    <div className="flex h-full min-h-0 flex-1 flex-col bg-cream">
      {prototype && <PrototypeBanner>SIMULASI · AI, suara & baca nota belum terhubung</PrototypeBanner>}
      <header className="flex items-center gap-2.5 border-b-3 border-ink bg-paper px-4 py-2.5">
        <IconLink href="/dashboard" aria-label="Kembali ke beranda">
          <Icon name="chevron-left" size={18} strokeWidth={3.2} />
        </IconLink>
        <Koko size={42} />
        <div className="flex min-w-0 flex-1 flex-col gap-px">
          <h1 className="m-0 font-body text-19 leading-[1.15] font-bold tracking-[-0.01em]">Catat cepat</h1>
          <div className="text-12 text-ink-600">Koko · asisten pencatat</div>
        </div>
        <Link href="/transactions/new" className="flex min-h-11 flex-none items-center gap-1.5 rounded-md border-2 border-ink px-2.5 text-12 font-bold text-ink no-underline hover:text-ink">
          <Icon name="pencil" size={16} strokeWidth={2.6} />
          <span>Form</span>
        </Link>
      </header>
      <QuickAddChat greeting={greeting} />
    </div>
  );
}
