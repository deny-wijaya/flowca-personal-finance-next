"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { container } from "@/di/container";
import { ValidationError } from "@/shared/domain/errors";
import { DEFAULT_PAGE_LIMIT } from "@/shared/domain/pagination";
import { HttpError } from "@/shared/infrastructure/http/http-error";
import { transactionFormSchema } from "./transaction-form-schema";
import {
  parseTransactionFilters,
  toTransactionFilter,
  toTransactionRow,
  type TransactionListFilters,
  type TransactionRowVM,
} from "./view-models/transaction-view-model";

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

export type LoadMoreTransactionsResult =
  | { status: "success"; rows: TransactionRowVM[]; nextCursor: string | null }
  | { status: "error"; message: string };

/**
 * Server Action untuk tombol "Muat lebih banyak" di menu Transaksi (daftar mobile dan tabel desktop).
 * Mengambil halaman berikutnya dari GET /transactions memakai `cursor` dari halaman sebelumnya,
 * dengan filter yang sama, lalu mengembalikan baris yang sudah siap ditampilkan.
 */
export async function loadMoreTransactionsAction(filters: TransactionListFilters, cursor: string): Promise<LoadMoreTransactionsResult> {
  // Input Server Action datang dari browser, jadi dibaca ulang lewat parser yang sama dengan URL.
  const now = new Date();
  const safeFilters = parseTransactionFilters({ ...filters }, now);
  if (typeof cursor !== "string" || cursor === "") return { status: "error", message: "Halaman berikutnya tidak ditemukan." };

  try {
    const [page, balances] = await Promise.all([
      container.listTransactions().execute(toTransactionFilter(safeFilters, now), { limit: DEFAULT_PAGE_LIMIT, cursor }),
      container.getAccountBalances().execute(),
    ]);
    const ctx = { now, accountNames: new Map(balances.accounts.map((account) => [account.id, account.name])) };
    return { status: "success", rows: page.items.map((trx) => toTransactionRow(trx, ctx)), nextCursor: page.nextCursor };
  } catch (error) {
    if (error instanceof HttpError) {
      console.error("[loadMoreTransactionsAction]", error.status, error.code, error.message);
      return { status: "error", message: "Gagal memuat transaksi berikutnya. Coba lagi." };
    }
    throw error;
  }
}
