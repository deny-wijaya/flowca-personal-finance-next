import type { QuickDraft, QuickEntryParser, ReceiptReader, ReceiptReading } from "../domain/quick-draft";

/**
 * Parser tiruan berbasis aturan (regex), disalin dari simulasi di desain.
 * Nanti diganti implementasi AI asli tanpa mengubah use case maupun UI.
 */
const CATEGORY_RULES: [RegExp, string][] = [
  [/gaji/, "Gaji"],
  [/freelance|proyek/, "Freelance"],
  [/bonus/, "Bonus"],
  [/hadiah|kado/, "Hadiah"],
  [/makan|kopi|minum|jajan|sarapan|bakso|nasi|snack/, "Makanan"],
  [/ojek|bensin|parkir|tol|bus|kereta|taksi|angkot/, "Transportasi"],
  [/listrik|token|pulsa|internet|wifi|kuota|pdam/, "Tagihan"],
  [/belanja|baju|sabun|beras|sayur|minyak/, "Belanja"],
  [/nonton|game|film|konser|langganan/, "Hiburan"],
  [/obat|dokter|apotek/, "Kesehatan"],
  [/buku|kursus|kelas/, "Pendidikan"],
];

const INCOME_HINT = /gaji|terima|dapat|masuk|bonus|dibayar|freelance|proyek|cair|hadiah/;
const BANK_HINT = /bank|debit|qris|transfer|rekening/;
const FILLER_WORDS = /\b(pakai|pake|via|dengan|dari|ke|tunai|cash|bank|rekening|debit|qris|tadi|kemarin|hari ini|aku|saya|beli|bayar|sebesar|udah|sudah)\b/gi;
const AMOUNT_PATTERN = /(\d{1,3}(?:\.\d{3})+|\d+(?:[.,]\d+)?)\s*(rb|ribu|k|jt|juta)?\b/i;

export function parseOne(phrase: string): QuickDraft | undefined {
  const match = phrase.match(AMOUNT_PATTERN);
  if (!match) return undefined;

  const raw = match[1];
  let amount = /^\d{1,3}(\.\d{3})+$/.test(raw) ? parseInt(raw.replace(/\./g, ""), 10) : parseFloat(raw.replace(",", "."));
  const unit = (match[2] ?? "").toLowerCase();
  if (unit === "rb" || unit === "ribu" || unit === "k") amount *= 1_000;
  else if (unit === "jt" || unit === "juta") amount *= 1_000_000;
  amount = Math.round(amount);
  if (!amount) return undefined;

  const lower = phrase.toLowerCase();
  const type = INCOME_HINT.test(lower) ? "income" : "expense";
  const category = CATEGORY_RULES.find(([pattern]) => pattern.test(lower))?.[1] ?? "Lainnya";
  let name = phrase.replace(match[0], " ").replace(FILLER_WORDS, " ").replace(/\s+/g, " ").trim() || category;
  name = name.charAt(0).toUpperCase() + name.slice(1);

  return {
    name,
    category,
    accountId: BANK_HINT.test(lower) ? "bank" : "cash",
    type,
    amount,
    day: /kemarin/.test(lower) ? "yesterday" : "today",
  };
}

export class RuleBasedQuickEntryParser implements QuickEntryParser {
  async parse(text: string): Promise<QuickDraft[]> {
    return text
      // Koma di antara angka ("6,5jt") adalah desimal, bukan pemisah transaksi.
      .split(/(?<!\d),|,(?!\d)|;|\sdan\s|\sterus\s|\slalu\s/i)
      .map((part) => parseOne(part.trim()))
      .filter((draft): draft is QuickDraft => Boolean(draft));
  }
}

/** Pembaca nota tiruan: selalu mengembalikan contoh nota dari desain. */
export class MockReceiptReader implements ReceiptReader {
  async read(): Promise<ReceiptReading> {
    return {
      draft: { name: "Belanja di Toko Sumber Rezeki", category: "Belanja", accountId: "cash", type: "expense", amount: 87_500, day: "today" },
      note: "3 item terbaca: beras 5 kg, minyak goreng 2 L, sabun cuci. Metode bayar tidak tertulis, jadi aku pilih Tunai.",
    };
  }
}
