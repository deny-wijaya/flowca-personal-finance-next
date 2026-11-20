import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/shared/lib/cn";

/**
 * Koko, maskot koin Flowca. Path pixel-art (viewBox 16x14) disalin apa adanya
 * dari desain; warnanya memakai token supaya tidak ada hex di komponen.
 */
const kokoVariants = cva("fc-pixel block flex-none", {
  variants: {
    size: {
      36: "h-8 w-9",
      40: "h-8.75 w-10",
      42: "h-9.25 w-10.5",
      48: "h-10.5 w-12",
      56: "h-12.25 w-14",
      64: "h-14 w-16",
      96: "h-21 w-24",
      112: "h-24.5 w-28",
      176: "h-38.5 w-44",
    },
    animate: { none: "", hop: "animate-pixel-hop" },
  },
  defaultVariants: { size: 64, animate: "none" },
});

type KokoProps = VariantProps<typeof kokoVariants> & { className?: string };

export function Koko({ size, animate, className }: KokoProps) {
  return (
    <svg viewBox="0 0 16 14" shapeRendering="crispEdges" aria-hidden="true" className={cn(kokoVariants({ size, animate }), className)}>
      <path className="fill-ink" d="M5 0h6v1h-6zM3 1h2v1h-2zM11 1h2v1h-2zM2 2h1v1h-1zM13 2h1v1h-1zM1 3h1v1h-1zM14 3h1v1h-1zM1 4h1v1h-1zM14 4h1v1h-1zM0 5h1v1h-1zM6 5h1v1h-1zM10 5h1v1h-1zM15 5h1v1h-1zM0 6h1v1h-1zM6 6h1v1h-1zM10 6h1v1h-1zM15 6h1v1h-1zM0 7h1v1h-1zM15 7h1v1h-1zM0 8h1v1h-1zM15 8h1v1h-1zM0 9h1v1h-1zM5 9h1v1h-1zM10 9h1v1h-1zM15 9h1v1h-1zM1 10h1v1h-1zM6 10h4v1h-4zM14 10h1v1h-1zM1 11h1v1h-1zM14 11h1v1h-1zM2 12h2v1h-2zM12 12h2v1h-2zM4 13h8v1h-8z" />
      <path className="fill-koko-rim" d="M5 1h6v1h-6zM3 2h2v1h-2zM11 2h2v1h-2zM2 3h1v1h-1zM13 3h1v1h-1zM2 4h1v1h-1zM13 4h1v1h-1zM1 5h1v1h-1zM14 5h1v1h-1zM1 6h1v1h-1zM14 6h1v1h-1zM1 7h1v1h-1zM14 7h1v1h-1zM1 8h1v1h-1zM14 8h1v1h-1zM1 9h1v1h-1zM14 9h1v1h-1zM2 10h1v1h-1zM13 10h1v1h-1zM2 11h2v1h-2zM12 11h2v1h-2zM4 12h8v1h-8z" />
      <path className="fill-koko-face" d="M5 2h6v1h-6zM3 3h2v1h-2zM7 3h6v1h-6zM3 4h1v1h-1zM6 4h7v1h-7zM2 5h4v1h-4zM7 5h3v1h-3zM11 5h3v1h-3zM2 6h4v1h-4zM7 6h3v1h-3zM11 6h3v1h-3zM2 7h12v1h-12zM2 8h1v1h-1zM5 8h6v1h-6zM13 8h1v1h-1zM2 9h3v1h-3zM6 9h4v1h-4zM11 9h3v1h-3zM3 10h3v1h-3zM10 10h3v1h-3zM4 11h8v1h-8z" />
      <path className="fill-cream" d="M5 3h2v1h-2zM4 4h2v1h-2z" />
      <path className="fill-koko-cheek" d="M3 8h2v1h-2zM11 8h2v1h-2z" />
    </svg>
  );
}
