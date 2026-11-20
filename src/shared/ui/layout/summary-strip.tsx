import { cn } from "@/shared/lib/cn";

type SummaryStripProps = { totalIn: string; totalOut: string; net: string; className?: string };

/** Strip MASUK / KELUAR / SELISIH (transaksi mobile). */
export function SummaryStrip({ totalIn, totalOut, net, className }: SummaryStripProps) {
  const cells = [
    { label: "MASUK", value: totalIn, tone: "text-income" },
    { label: "KELUAR", value: totalOut, tone: "text-danger" },
    { label: "SELISIH", value: net, tone: "" },
  ];
  return (
    <div className={cn("grid grid-cols-3 overflow-hidden rounded-xl border-3 border-ink bg-paper", className)}>
      {cells.map((cell, index) => (
        <div key={cell.label} className={cn("flex flex-col gap-0.5 p-2.5", index < 2 && "border-r-2 border-dashed border-sand-400")}>
          <span className="text-11 font-bold text-ink-600">{cell.label}</span>
          <span className={cn("fc-num text-14 font-bold", cell.tone)}>{cell.value}</span>
        </div>
      ))}
    </div>
  );
}
