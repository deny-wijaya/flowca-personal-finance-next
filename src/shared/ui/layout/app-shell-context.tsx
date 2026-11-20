"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

type AppShellState = {
  /** Panel kanan (Catat cepat) di desktop. */
  panelOpen: boolean;
  openPanel: () => void;
  closePanel: () => void;
  togglePanel: () => void;
};

const AppShellContext = createContext<AppShellState | null>(null);

export function AppShellProvider({ children }: { children: ReactNode }) {
  const [panelOpen, setPanelOpen] = useState(false);
  const value = useMemo<AppShellState>(
    () => ({
      panelOpen,
      openPanel: () => setPanelOpen(true),
      closePanel: () => setPanelOpen(false),
      togglePanel: () => setPanelOpen((open) => !open),
    }),
    [panelOpen],
  );
  return <AppShellContext.Provider value={value}>{children}</AppShellContext.Provider>;
}

export function useAppShell() {
  const value = useContext(AppShellContext);
  if (!value) throw new Error("useAppShell harus dipakai di dalam <AppShell>.");
  return value;
}
