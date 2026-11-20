import type { ReactNode } from "react";
import { cn } from "@/shared/lib/cn";
import { Koko } from "./koko";

/** Kartu kosong bergaris putus: Koko + judul + satu kalimat. */
export function EmptyState({ title, body, withKoko = true, className, children }: { title: string; body: string; withKoko?: boolean; className?: string; children?: ReactNode }) {
  return (
    <div className={cn("flex flex-col items-center gap-2 rounded-2xl border-3 border-dashed border-ink bg-paper px-4.5 py-7 text-center", className)}>
      {withKoko && <Koko size={64} />}
      <div className="font-display text-20 font-bold">{title}</div>
      <div className="text-14 text-ink-600">{body}</div>
      {children}
    </div>
  );
}
