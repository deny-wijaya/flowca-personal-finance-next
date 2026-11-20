import type { CategoryTileTone } from "@/shared/ui/primitives/category-tile";

/**
 * Satu-satunya pemetaan kategori -> warna tile. Komponen tidak boleh
 * menulis ternary warna kategori sendiri.
 */
const CATEGORY_TONE: Record<string, CategoryTileTone> = {
  Makanan: "orange",
  Transportasi: "cyan",
  Tagihan: "pink",
  Belanja: "coral",
  Hiburan: "lilac",
  Kesehatan: "green",
  Pendidikan: "cyan",
  Gaji: "green",
  Freelance: "green",
  Bonus: "orange",
  Hadiah: "pink",
  Investasi: "cyan",
  Lainnya: "sand",
};

export function categoryTone(category: string): CategoryTileTone {
  return CATEGORY_TONE[category] ?? "paper";
}

export function categoryInitial(category: string) {
  return category.charAt(0).toUpperCase();
}
