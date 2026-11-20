"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/shared/lib/cn";
import { Icon } from "../primitives/icon";
import { BOTTOM_NAV_ITEMS, isActivePath, type NavItem } from "./nav-items";

/** Navigasi bawah (< 1024px): 4 item + tombol tengah Catat cepat yang naik 26px. */
export function BottomNav({ className }: { className?: string }) {
  const pathname = usePathname();

  return (
    <nav aria-label="Navigasi utama" className={cn("relative grid grid-cols-5 items-start border-t-3 border-ink bg-paper px-1 pt-1.5 pb-3.5", className)}>
      {BOTTOM_NAV_ITEMS.left.map((item) => (
        <NavLink key={item.href} item={item} active={isActivePath(pathname, item.href)} />
      ))}
      <Link
        href="/quick-add"
        aria-label="Catat cepat dengan AI: ketik, bicara, atau foto nota"
        className="fc-press relative -mt-6.5 flex size-16 items-center justify-center self-start justify-self-center rounded-3xl border-3 border-ink bg-orange text-ink shadow-hard-2 hover:text-ink"
      >
        <Icon name="plus" size={30} strokeWidth={3.4} />
        <span aria-hidden="true" className="absolute -top-2.25 -right-2.75 rounded-xs border-2 border-ink bg-pink px-1 font-display text-11 leading-4 font-bold">
          AI
        </span>
      </Link>
      {BOTTOM_NAV_ITEMS.right.map((item) => (
        <NavLink key={item.href} item={item} active={isActivePath(pathname, item.href)} />
      ))}
    </nav>
  );
}

function NavLink({ item, active }: { item: NavItem; active: boolean }) {
  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      className="flex min-h-14 flex-col items-center justify-center gap-1 text-11 font-bold text-ink no-underline hover:text-ink"
    >
      <span
        aria-hidden="true"
        className={cn("flex h-7.5 w-11 items-center justify-center rounded-md border-2", active ? "border-ink bg-coral" : "border-transparent")}
      >
        <Icon name={item.icon} size={20} strokeWidth={2.4} />
      </span>
      <span>{item.label}</span>
    </Link>
  );
}
