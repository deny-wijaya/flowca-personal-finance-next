import type { IconName } from "../primitives/icon";

export type NavItem = { href: string; label: string; icon: IconName };

/** Menu BottomNav (mobile). Tombol tengah "Catat cepat" dirender terpisah. */
export const BOTTOM_NAV_ITEMS = {
  left: [
    { href: "/dashboard", label: "Beranda", icon: "home" },
    { href: "/transactions", label: "Transaksi", icon: "list" },
  ],
  right: [
    { href: "/budget", label: "Anggaran", icon: "pie" },
    { href: "/accounts", label: "Akun", icon: "wallet" },
  ],
} as const satisfies Record<string, readonly NavItem[]>;

/** Menu Sidebar (desktop ≥ 1024px). */
export const SIDEBAR_NAV_ITEMS: readonly NavItem[] = [
  { href: "/dashboard", label: "Beranda", icon: "home" },
  { href: "/transactions", label: "Transaksi", icon: "list" },
  { href: "/budget", label: "Anggaran", icon: "pie" },
  { href: "/insights", label: "Insight", icon: "chart" },
  { href: "/accounts", label: "Akun", icon: "wallet" },
  { href: "/settings", label: "Pengaturan", icon: "gear" },
];

export function isActivePath(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}
