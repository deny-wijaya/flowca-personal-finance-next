/** Spinner pixel 4 warna. Status loading diumumkan oleh elemen induk (aria-busy / role=status). */
export function Spinner({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" aria-hidden="true" shapeRendering="crispEdges" className="flex-none animate-pixel-spin">
      <rect x="8" y="0" width="4" height="5" className="fill-ink" />
      <rect x="8" y="15" width="4" height="5" className="fill-cyan" />
      <rect x="0" y="8" width="5" height="4" className="fill-coral" />
      <rect x="15" y="8" width="5" height="4" className="fill-orange" />
    </svg>
  );
}
