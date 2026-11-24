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
  type CategoryOptionVM,
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
    categoryId: formData.get("categoryId") || undefined,
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
      categoryId: input.categoryId!,
      note: input.note,
      accountId: input.accountId,
      occurredAt: new Date(`${input.date}T${input.time}`),
    });
  } catch (error) {
    if (error instanceof ValidationError) {
      return { status: "error", message: error.message, fieldErrors: error.field ? { [error.field]: [error.message] } : undefined };
    }
    if (error instanceof HttpError && error.status === 400 && categoryIdError(error)) {
      // Kategori ditolak backend (tidak ditemukan atau jenisnya tidak cocok): tampilkan di bawah chip kategori.
      return { status: "error", message: error.message, fieldErrors: { categoryId: [categoryIdError(error)!] } };
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

/** Pesan error untuk field category_id dari response 400 backend, kalau ada. */
function categoryIdError(error: HttpError): string | undefined {
  const parsed = z.object({ fieldErrors: z.object({ category_id: z.array(z.string()).min(1) }) }).safeParse(error.details);
  return parsed.success ? parsed.data.fieldErrors.category_id[0] : undefined;
}

export type CreateCategoryResult =
  | { status: "success"; category: CategoryOptionVM }
  | { status: "error"; message: string };

/**
 * Server Action untuk chip "+ Kategori baru" di form Tambah transaksi.
 * Membuat kategori kustom lewat POST /categories, lalu mengembalikannya supaya form bisa langsung memilihnya.
 */
export async function createCategoryAction(input: { name: string; type: "income" | "expense" }): Promise<CreateCategoryResult> {
  const parsed = z.object({ name: z.string(), type: z.enum(["income", "expense"]) }).safeParse(input);
  if (!parsed.success) return { status: "error", message: "Data kategori tidak valid." };

  try {
    const category = await container.createCategory().execute(parsed.data);
    // Filter Kategori di menu Transaksi ikut memuat kategori baru ini.
    revalidatePath("/transactions");
    return { status: "success", category: { id: category.id, name: category.name, type: category.type } };
  } catch (error) {
    if (error instanceof ValidationError) return { status: "error", message: error.message };
    if (error instanceof HttpError) {
      console.error("[createCategoryAction]", error.status, error.code, error.message);
      return { status: "error", message: "Gagal menyimpan kategori. Coba lagi." };
    }
    throw error;
  }
}
