import { cn } from "@/shared/lib/cn";

/** Pita gelap "MODE PROTOTIPE · …". Dirender hanya saat mode mock aktif (diputuskan oleh pemanggil). */
export function PrototypeBanner({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("flex items-center gap-2 bg-ink px-4 py-1.75 text-11 font-semibold tracking-[0.06em] text-cream", className)}>
      <span aria-hidden="true" className="inline-block size-2 flex-none bg-orange" />
      <span>{children}</span>
    </div>
  );
}
