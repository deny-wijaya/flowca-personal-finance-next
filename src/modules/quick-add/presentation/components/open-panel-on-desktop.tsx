"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAppShell } from "@/shared/ui/layout/app-shell-context";

/** Di ≥ 1024px, rute /quick-add membuka beranda dengan panel Catat cepat terbuka. */
export function OpenPanelOnDesktop() {
  const router = useRouter();
  const { openPanel } = useAppShell();

  useEffect(() => {
    if (window.matchMedia("(min-width: 1024px)").matches) {
      openPanel();
      router.replace("/dashboard");
    }
  }, [openPanel, router]);

  return null;
}
