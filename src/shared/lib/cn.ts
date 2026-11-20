import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/**
 * tailwind-merge perlu tahu skala token Flowca (lihat tokens.css). Tanpa ini,
 * `text-15` (ukuran huruf) dianggap warna dan bisa menghapus `text-ink`.
 */
const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      text: ["11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "22", "24", "26", "28", "30", "32", "34", "36", "52"],
      shadow: ["hard-1", "hard-2", "hard-3", "hard-4", "hard-5"],
      radius: ["sheet"],
      font: ["display", "body"],
      animate: ["pixel-spin", "pixel-wave", "pixel-blink", "pixel-hop"],
    },
  },
});

/** Gabungkan class Tailwind; class yang datang belakangan menang bila bentrok. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
