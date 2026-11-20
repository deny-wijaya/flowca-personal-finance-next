"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { cn } from "@/shared/lib/cn";
import { Icon } from "../primitives/icon";
import { Koko } from "../primitives/koko";
import { useAppShell } from "./app-shell-context";
import { isActivePath, SIDEBAR_NAV_ITEMS } from "./nav-items";

/** Sidebar desktop: logo, tombol Catat cepat (+ pintasan N), 6 menu, slot kartu profil. */
export function Sidebar({ footer, className }: { footer?: ReactNode; className?: string }) {
  const pathname = usePathname();
  const { panelOpen, togglePanel, openPanel } = useAppShell();

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      const typing = target?.closest("input, textarea, select, [contenteditable='true']");
      if (typing || event.metaKey || event.ctrlKey || event.altKey) return;
      if (event.key === "n" || event.key === "N") {
        event.preventDefault();
        openPanel();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [openPanel]);

  return (
    <aside className={cn("sticky top-0 h-dvh w-70 flex-none flex-col gap-5 overflow-y-auto border-r-3 border-ink bg-paper px-4 py-5.5", className)}>
      <div className="flex items-center gap-2.5 px-1">
        <Koko size={42} />
        <div className="font-display text-28 leading-none font-bold">Flowca</div>
      </div>

      <button
        type="button"
        onClick={togglePanel}
        aria-expanded={panelOpen}
        aria-controls="quick-panel"
        className="fc-press relative flex h-14 w-full items-center gap-2.5 rounded-xl border-3 border-ink bg-orange px-3.5 font-body text-16 font-bold text-ink shadow-hard-2"
      >
        <Icon name="plus" size={22} strokeWidth={3.2} />
        <span className="flex-1 text-left whitespace-nowrap">Catat cepat</span>
        <span className="rounded-xs border-2 border-ink bg-pink px-1.25 font-display text-12 leading-4.5">AI</span>
        <kbd className="rounded-xs border-2 border-ink bg-paper px-1.5 font-body text-12 leading-4.5">N</kbd>
      </button>

      <nav aria-label="Navigasi utama">
        <ul className="m-0 flex list-none flex-col gap-1 p-0">
          {SIDEBAR_NAV_ITEMS.map((item) => {
            const active = isActivePath(pathname, item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex min-h-11.5 items-center gap-3 rounded-lg border-2 px-3 text-15 font-bold text-ink no-underline hover:text-ink",
                    active ? "border-ink bg-coral" : "border-transparent hover:bg-orange-100",
                  )}
                >
                  <Icon name={item.icon} size={20} strokeWidth={2.4} />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {footer && <div className="mt-auto">{footer}</div>}
    </aside>
  );
}
