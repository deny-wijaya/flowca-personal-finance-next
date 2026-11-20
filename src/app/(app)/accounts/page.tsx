import type { Metadata } from "next";
import { ComingSoonScreen } from "@/shared/ui/layout/coming-soon-screen";

export const metadata: Metadata = { title: "Akun" };

/** Layar belum didesain (di luar PRD UI saat ini). */
export default function Page() {
  return <ComingSoonScreen title="Akun" body="Kelola saldo per akun akan segera hadir." />;
}
