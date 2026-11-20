import type { SVGProps } from "react";

/**
 * Satu sumber ikon Flowca. Path disalin dari file desain (viewBox 24, garis tebal,
 * ujung kotak) supaya tampilannya tetap sama di semua layar.
 */
const ICONS = {
  home: { d: <path d="M3 11l9-7 9 7v9h-6v-6H9v6H3z" />, stroke: 2.4, cap: "butt" },
  list: { d: <path d="M9 6h11M9 12h11M9 18h11M4 6h1M4 12h1M4 18h1" />, stroke: 2.4, cap: "square" },
  pie: {
    d: (
      <>
        <path d="M12 3a9 9 0 1 0 9 9h-9z" />
        <path d="M15 3.5A9 9 0 0 1 20.5 9H15z" />
      </>
    ),
    stroke: 2.4,
    cap: "butt",
  },
  chart: { d: <path d="M5 20V11M12 20V5M19 20v-7M2 20h20" />, stroke: 2.4, cap: "square" },
  wallet: {
    d: (
      <>
        <rect x="3" y="6" width="18" height="13" rx="2" />
        <path d="M16 11h5v4h-5z" />
      </>
    ),
    stroke: 2.4,
    cap: "butt",
  },
  card: {
    d: (
      <>
        <rect x="3" y="6" width="18" height="13" rx="2" />
        <path d="M3 10h18M16 15h2" />
      </>
    ),
    stroke: 2.2,
    cap: "butt",
  },
  gear: {
    d: (
      <>
        <circle cx="12" cy="12" r="3" />
        <path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1" />
      </>
    ),
    stroke: 2.4,
    cap: "square",
  },
  mic: {
    d: (
      <>
        <rect x="9" y="3" width="6" height="11" rx="3" />
        <path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
      </>
    ),
    stroke: 2.6,
    cap: "butt",
  },
  cam: {
    d: (
      <>
        <path d="M3 8h4l2-3h6l2 3h4v12H3z" />
        <circle cx="12" cy="13" r="3.5" />
      </>
    ),
    stroke: 2.4,
    cap: "butt",
  },
  plus: { d: <path d="M12 4v16M4 12h16" />, stroke: 3, cap: "square" },
  send: { d: <path d="M4 12h15M13 6l6 6-6 6" />, stroke: 2.8, cap: "square" },
  x: { d: <path d="M5 5l14 14M19 5L5 19" />, stroke: 3.2, cap: "square" },
  search: {
    d: (
      <>
        <circle cx="10" cy="10" r="6" />
        <path d="M15 15l5 5" />
      </>
    ),
    stroke: 2.6,
    cap: "square",
  },
  "chevron-left": { d: <path d="M15 5l-7 7 7 7" />, stroke: 3, cap: "square" },
  "chevron-right": { d: <path d="M9 5l7 7-7 7" />, stroke: 3, cap: "square" },
  eye: {
    d: (
      <>
        <path d="M3 12s3.5-6 9-6 9 6 9 6-3.5 6-9 6-9-6-9-6z" />
        <circle cx="12" cy="12" r="3" />
      </>
    ),
    stroke: 2.2,
    cap: "butt",
  },
  "eye-off": {
    d: (
      <>
        <path d="M3 3l18 18M10.6 6.1A9.8 9.8 0 0 1 12 6c5.5 0 9 6 9 6a15.6 15.6 0 0 1-3.1 3.8M6.2 7.6C4.2 9.1 3 12 3 12s3.5 6 9 6c1.4 0 2.7-.4 3.8-1" />
        <path d="M9.9 10a3 3 0 0 0 4.1 4.1" />
      </>
    ),
    stroke: 2.2,
    cap: "butt",
  },
  check: { d: <path d="M4 12l5 5L20 6" />, stroke: 3, cap: "square" },
  retry: { d: <path d="M4 12a8 8 0 1 0 2.3-5.7M4 4v4h4" />, stroke: 3, cap: "square" },
  logout: { d: <path d="M10 4H5v16h5M14 8l4 4-4 4M18 12H9" />, stroke: 2.4, cap: "square" },
  user: {
    d: (
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21c0-4 3.6-7 8-7s8 3 8 7" />
      </>
    ),
    stroke: 2.2,
    cap: "butt",
  },
  pencil: { d: <path d="M4 20h4L20 8l-4-4L4 16z" />, stroke: 3, cap: "square" },
  download: { d: <path d="M12 3v12M6 10l6 6 6-6M4 21h16" />, stroke: 2.6, cap: "square" },
} as const;

export type IconName = keyof typeof ICONS;

type IconProps = Omit<SVGProps<SVGSVGElement>, "children" | "stroke"> & {
  name: IconName;
  /** Lebar & tinggi dalam px. */
  size?: number;
  /** Tebal garis; default mengikuti desain tiap ikon. */
  strokeWidth?: number;
};

/** Ikon dekoratif: `aria-hidden` default. Beri label di elemen induknya. */
export function Icon({ name, size = 20, strokeWidth, ...props }: IconProps) {
  const icon = ICONS[name];
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth ?? icon.stroke}
      strokeLinecap={icon.cap}
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {icon.d}
    </svg>
  );
}
