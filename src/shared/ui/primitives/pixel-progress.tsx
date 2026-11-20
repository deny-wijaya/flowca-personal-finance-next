import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/shared/lib/cn";

/** Progres bersegmen ala 8-bit. `filled` = jumlah segmen terisi (sudah dihitung di mapper). */
const trackVariants = cva("grid border-ink", {
  variants: {
    size: {
      sm: "h-3.5 gap-0.5 border-2 bg-field p-px",
      md: "h-4.5 gap-0.75 border-3 bg-paper p-0.5",
      lg: "h-5.5 gap-0.5 border-3 bg-paper p-0.5",
    },
    segments: { 4: "grid-cols-4", 10: "grid-cols-10", 20: "grid-cols-20" },
  },
  defaultVariants: { size: "sm", segments: 10 },
});

const segmentVariants = cva("", {
  variants: {
    tone: { safe: "bg-cyan", warn: "bg-orange", over: "bg-coral", pink: "bg-pink", ink: "bg-ink" },
  },
  defaultVariants: { tone: "ink" },
});

type Tone = NonNullable<VariantProps<typeof segmentVariants>["tone"]>;

type PixelProgressProps = VariantProps<typeof trackVariants> & {
  filled: number;
  /** Satu warna untuk semua segmen terisi, atau daftar warna per segmen (onboarding). */
  tone?: Tone | readonly Tone[];
  /** Label untuk pembaca layar. Tanpa label, progres dianggap dekoratif. */
  label?: string;
  valueNow?: number;
  valueMin?: number;
  valueMax?: number;
  className?: string;
};

export function PixelProgress({ size, segments = 10, filled, tone = "ink", label, valueNow, valueMin = 0, valueMax = 100, className }: PixelProgressProps) {
  const count = segments ?? 10;
  const a11y = label
    ? { role: "progressbar" as const, "aria-label": label, "aria-valuemin": valueMin, "aria-valuemax": valueMax, "aria-valuenow": valueNow ?? filled }
    : { "aria-hidden": true as const };

  return (
    <div className={cn(trackVariants({ size, segments }), className)} {...a11y}>
      {Array.from({ length: count }, (_, index) => {
        const segmentTone = typeof tone === "string" ? tone : tone[index];
        return <span key={index} className={index < filled ? segmentVariants({ tone: segmentTone }) : undefined} />;
      })}
    </div>
  );
}
