import { cva } from "class-variance-authority";

/** Ilustrasi pixel-art layar auth. Warna lewat class token (fill-*), bukan hex. */
export function EnvelopeArt() {
  return (
    <svg viewBox="0 0 18 13" shapeRendering="crispEdges" aria-hidden="true" className="fc-pixel block h-26 w-36">
      <rect x="0" y="1" width="18" height="12" className="fill-ink" />
      <rect x="1" y="2" width="16" height="10" className="fill-paper" />
      <g className="fill-ink">
        <rect x="1" y="2" width="2" height="1" />
        <rect x="3" y="3" width="2" height="1" />
        <rect x="5" y="4" width="2" height="1" />
        <rect x="7" y="5" width="4" height="1" />
        <rect x="11" y="4" width="2" height="1" />
        <rect x="13" y="3" width="2" height="1" />
        <rect x="15" y="2" width="2" height="1" />
      </g>
      <rect x="1" y="3" width="2" height="9" className="fill-cyan" />
      <rect x="15" y="3" width="2" height="9" className="fill-cyan" />
      <rect x="13" y="0" width="5" height="4" className="fill-ink" />
      <rect x="14" y="1" width="3" height="2" className="fill-coral" />
    </svg>
  );
}

const lockBody = cva("", { variants: { tone: { orange: "fill-orange", cyan: "fill-cyan", coral: "fill-coral" } } });

/** Gembok: oranye = form, cyan = berhasil, coral = link kedaluwarsa. */
export function LockArt({ tone }: { tone: "orange" | "cyan" | "coral" }) {
  return (
    <svg viewBox="0 0 12 14" shapeRendering="crispEdges" aria-hidden="true" className="fc-pixel block h-24.5 w-21">
      <rect x="3" y="0" width="6" height="1" className="fill-ink" />
      <rect x="2" y="1" width="1" height="5" className="fill-ink" />
      <rect x="9" y="1" width="1" height="5" className="fill-ink" />
      <rect x="3" y="1" width="6" height="1" className="fill-sand-300" />
      <rect x="0" y="6" width="12" height="8" className="fill-ink" />
      <rect x="1" y="7" width="10" height="6" className={lockBody({ tone })} />
      <rect x="5" y="8" width="2" height="2" className="fill-ink" />
      <rect x="5" y="10" width="2" height="2" className="fill-ink" />
      <rect x="1" y="7" width="10" height="1" className="fill-cream" opacity="0.5" />
    </svg>
  );
}
