"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { container } from "@/di/container";
import { ValidationError } from "@/shared/domain/errors";
import { HttpError } from "@/shared/infrastructure/http/http-error";
import { transactionFormSchema } from "./transaction-form-schema";

export type CreateTransactionState =
  | { status: "idle" }
  | { status: "success"; savedAt: number }
  | { status: "error"; message: string; fieldErrors?: Record<string, string[] | undefined> };

/**
 * Server Action untuk layar "Tambah transaksi".
 * Action sengaja dibuat tipis: validasi input, panggil use case, terjemahkan error.
 * Form-nya client component yang memegang nilai sendiri, jadi tidak perlu mengembalikan `values`.
 */
export async function createTransactionAction(_prev: CreateTransactionState, formData: FormData): Promise<CreateTransactionState> {
  const parsed = transactionFormSchema.safeParse({
    type: formData.get("type"),
    amount: String(formData.get("amount") ?? ""),
    category: formData.get("category") || undefined,
    accountId: formData.get("accountId") ?? "",
    toAccountId: formData.get("toAccountId") || undefined,
    date: formData.get("date"),
    time: formData.get("time"),
    note: formData.get("note") || undefined,
  });

  if (!parsed.success) {
    return { status: "error", message: "Periksa kembali isian form.", fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }

  const input = parsed.data;
  if (input.type === "tf") {
    // TODO(transaction): domain belum punya jenis transfer antar akun.
    return { status: "error", message: "Transfer antar akun belum tersedia. Catat sebagai pengeluaran dan pemasukan dulu, ya." };
  }

  try {
    await container.createTransaction().execute({
      type: input.type === "in" ? "income" : "expense",
      amount: input.amount,
      category: input.category!,
      note: input.note,
      accountId: input.accountId,
      occurredAt: new Date(`${input.date}T${input.time}`),
    });
  } catch (error) {
    if (error instanceof ValidationError) {
      return { status: "error", message: error.message, fieldErrors: error.field ? { [error.field]: [error.message] } : undefined };
    }
    if (error instanceof HttpError) {
      console.error("[createTransactionAction]", error.status, error.code, error.message);
      return { status: "error", message: error.status >= 400 && error.status < 500 ? error.message : "Server sedang bermasalah, coba lagi nanti." };
    }
    throw error;
  }

  revalidatePath("/", "layout");
  return { status: "success", savedAt: Date.now() };
}
