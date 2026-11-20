import { cn } from "@/shared/lib/cn";

/** Garis putus-putus dengan teks di tengah, mis. "atau pakai email". */
export function TextDivider({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("flex items-center gap-2.5 text-12 font-semibold text-ink-600", className)}>
      <span className="h-0 flex-1 border-t-2 border-dashed border-sand-400" />
      <span>{children}</span>
      <span className="h-0 flex-1 border-t-2 border-dashed border-sand-400" />
    </div>
  );
}
