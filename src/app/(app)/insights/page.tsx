import type { Metadata } from "next";
import { ComingSoonScreen } from "@/shared/ui/layout/coming-soon-screen";

export const metadata: Metadata = { title: "Insight" };

/** Layar belum didesain (di luar PRD UI saat ini). */
export default function Page() {
  return <ComingSoonScreen title="Insight" body="Grafik tren pengeluaranmu sedang disiapkan Koko." />;
}
