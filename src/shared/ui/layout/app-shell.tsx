"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { AppShellProvider, useAppShell } from "./app-shell-context";
import { BottomNav } from "./bottom-nav";
import { Sidebar } from "./sidebar";

type AppShellProps = {
  children: ReactNode;
  /** Kartu profil di bawah sidebar. */
  sidebarFooter?: ReactNode;
  /** Panel kanan desktop (Catat cepat). Dirender saat panel dibuka. */
  rightPanel?: ReactNode;
};

/** Kerangka halaman terproteksi: BottomNav < 1024px, Sidebar + panel kanan ≥ 1024px. */
export function AppShell(props: AppShellProps) {
  return (
    <AppShellProvider>
      <ShellLayout {...props} />
    </AppShellProvider>
  );
}

/** Halaman mobile yang tampil penuh tanpa BottomNav. */
const FULLSCREEN_MOBILE = ["/quick-add"];

function ShellLayout({ children, sidebarFooter, rightPanel }: AppShellProps) {
  const pathname = usePathname();
  const { panelOpen } = useAppShell();
  const fullscreen = FULLSCREEN_MOBILE.some((path) => pathname.startsWith(path));

  return (
    <div className="flex h-dvh flex-col bg-cream lg:h-auto lg:min-h-dvh lg:flex-row lg:items-stretch">
      <Sidebar footer={sidebarFooter} className="hidden lg:flex" />
      <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto lg:overflow-visible">{children}</main>
      {panelOpen && rightPanel && <div className="sticky top-0 hidden h-dvh w-85 flex-none lg:flex">{rightPanel}</div>}
      {!fullscreen && <BottomNav className="flex-none lg:hidden" />}
    </div>
  );
}
