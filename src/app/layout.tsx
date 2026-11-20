import type { Metadata, Viewport } from "next";
import { Pixelify_Sans, Space_Grotesk, Space_Mono } from "next/font/google";
import "./globals.css";

/** Font dimuat sekali di sini dan diekspos sebagai CSS variable yang dirujuk tokens.css. */
const pixelify = Pixelify_Sans({ variable: "--font-pixelify", subsets: ["latin"], weight: ["500", "600", "700"] });
const spaceGrotesk = Space_Grotesk({ variable: "--font-space-grotesk", subsets: ["latin"], weight: ["400", "500", "600", "700"] });
const spaceMono = Space_Mono({ variable: "--font-space-mono", subsets: ["latin"], weight: ["400"] });

export const metadata: Metadata = {
  title: { default: "Flowca", template: "%s · Flowca" },
  description: "Teman kecil untuk keuangan harianmu. Catat pemasukan, pengeluaran, dan anggaran bulanan.",
};

export const viewport: Viewport = { themeColor: "#FFF6E5" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="id" className={`${pixelify.variable} ${spaceGrotesk.variable} ${spaceMono.variable}`}>
      <body className="min-h-dvh bg-cream font-body text-ink">{children}</body>
    </html>
  );
}
