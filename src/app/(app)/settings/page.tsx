import type { Metadata } from "next";
import { ComingSoonScreen } from "@/shared/ui/layout/coming-soon-screen";

export const metadata: Metadata = { title: "Pengaturan" };

/** Layar belum didesain (di luar PRD UI saat ini). */
export default function Page() {
  return <ComingSoonScreen title="Pengaturan" body="Atur profil, kategori, dan pengingat sebentar lagi." />;
}
