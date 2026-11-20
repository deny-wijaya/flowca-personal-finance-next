import { z } from "zod";

/**
 * Validasi input form "Tambah transaksi" (bentuk & tipe data). Aturan bisnis tetap
 * dicek ulang di domain (`assertValidNewTransaction`), karena form bukan satu-satunya pintu masuk data.
 */
export const FORM_TYPES = ["out", "in", "tf"] as const;
export type FormType = (typeof FORM_TYPES)[number];

export const transactionFormSchema = z
  .object({
    type: z.enum(FORM_TYPES, { error: "Pilih jenis transaksi" }),
    amount: z
      .string()
      .transform((value) => Number(value.replace(/\D/g, "")) || 0)
      .pipe(z.number().int().positive("Isi jumlahnya dulu, ya.")),
    category: z.string().optional(),
    accountId: z.string().min(1, "Pilih akun"),
    toAccountId: z.string().optional(),
    date: z.iso.date("Tanggal tidak valid"),
    time: z.iso.time({ precision: -1, error: "Jam tidak valid" }),
    note: z.string().max(200, "Catatan maksimal 200 karakter").optional(),
  })
  .superRefine((value, ctx) => {
    if (value.type !== "tf" && !value.category) ctx.addIssue({ code: "custom", path: ["category"], message: "Pilih satu kategori." });
    if (value.type === "tf" && value.accountId === value.toAccountId)
      ctx.addIssue({ code: "custom", path: ["toAccountId"], message: "Akun asal dan tujuan tidak boleh sama." });
  });

export type TransactionFormValues = z.infer<typeof transactionFormSchema>;
