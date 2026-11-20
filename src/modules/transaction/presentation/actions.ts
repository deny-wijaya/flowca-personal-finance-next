"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { container } from "@/di/container";
import { ValidationError } from "@/shared/domain/errors";
import { HttpError } from "@/shared/infrastructure/http/http-error";
import { transactionFormSchema } from "./transaction-form-schema";

export type CreateTransactionState =
  | { status: "idle" }
  | { status: "success"; message: string }
  | {
      status: "error";
      message: string;
      fieldErrors?: Record<string, string[] | undefined>;
      /** Nilai yang tadi diisi user, supaya form tidak kosong lagi setelah gagal. */
      values?: Record<string, string>;
    };

/**
 * Server Action untuk form "Tambah Transaksi".
 * Action sengaja dibuat tipis: validasi input, panggil use case, terjemahkan error.
 */
export async function createTransactionAction(
  _prevState: CreateTransactionState,
  formData: FormData,
): Promise<CreateTransactionState> {
  const values = {
    type: String(formData.get("type") ?? ""),
    amount: String(formData.get("amount") ?? ""),
    category: String(formData.get("category") ?? ""),
    occurredAt: String(formData.get("occurredAt") ?? ""),
    note: String(formData.get("note") ?? ""),
  };

  const parsed = transactionFormSchema.safeParse({ ...values, note: values.note || undefined });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Periksa kembali isian form.",
      fieldErrors: z.flattenError(parsed.error).fieldErrors,
      values,
    };
  }

  const { occurredAt, ...rest } = parsed.data;

  try {
    await container.createTransaction().execute({
      ...rest,
      occurredAt: new Date(`${occurredAt}T00:00:00`),
    });
  } catch (error) {
    if (error instanceof ValidationError) {
      return {
        status: "error",
        message: error.message,
        fieldErrors: error.field ? { [error.field]: [error.message] } : undefined,
        values,
      };
    }
    if (error instanceof HttpError) {
      console.error("[createTransactionAction]", error.status, error.code, error.message);
      return {
        status: "error",
        message: error.status >= 400 && error.status < 500 ? error.message : "Server sedang bermasalah, coba lagi nanti.",
        values,
      };
    }
    throw error;
  }

  revalidatePath("/dashboard");
  revalidatePath("/transactions");
  return { status: "success", message: "Transaksi berhasil disimpan." };
}
