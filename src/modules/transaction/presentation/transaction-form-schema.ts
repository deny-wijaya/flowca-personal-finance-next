import { z } from "zod";
import { TRANSACTION_TYPES } from "../domain/transaction";

/**
 * Validasi input form (bentuk & tipe data). Aturan bisnis tetap dicek ulang
 * di domain (`assertValidNewTransaction`), karena form bukan satu-satunya pintu masuk data.
 */
export const transactionFormSchema = z.object({
  type: z.enum(TRANSACTION_TYPES, { error: "Pilih jenis transaksi" }),
  amount: z.coerce
    .number({ error: "Nominal harus berupa angka" })
    .int("Nominal tidak boleh desimal")
    .positive("Nominal harus lebih dari 0"),
  category: z.string().min(1, "Pilih kategori"),
  occurredAt: z.iso.date("Tanggal tidak valid"),
  note: z.string().max(200, "Catatan maksimal 200 karakter").optional(),
});

export type TransactionFormValues = z.infer<typeof transactionFormSchema>;
