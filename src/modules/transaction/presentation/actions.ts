"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { container } from "@/di/container";
import type { NewTransaction } from "../domain/transaction";
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

/** Isi form "Tambah transaksi" atau "Ubah transaksi" yang sudah divalidasi, siap dikirim ke use case. */
type ParsedForm = { ok: true; input: NewTransaction } | { ok: false; state: CreateTransactionState };

function parseTransactionForm(formData: FormData): ParsedForm {
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
    return { ok: false, state: { status: "error", message: "Periksa kembali isian form.", fieldErrors: z.flattenError(parsed.error).fieldErrors } };
  }

  const input = parsed.data;
  if (input.type === "tf") {
    // TODO(transaction): domain belum punya jenis transfer antar akun.
    return { ok: false, state: { status: "error", message: "Transfer antar akun belum tersedia. Catat sebagai pengeluaran dan pemasukan dulu, ya." } };
  }
  return {
    ok: true,
    input: {
      type: input.type === "in" ? "income" : "expense",
      amount: input.amount,
      categoryId: input.categoryId!,
      note: input.note,
      accountId: input.accountId,
      occurredAt: new Date(`${input.date}T${input.time}`),
    },
  };
}

/** Menerjemahkan error dari use case menjadi state form. Error yang tidak dikenal dilempar ke error boundary. */
function toFormState(error: unknown, tag: string): CreateTransactionState {
  if (error instanceof ValidationError) {
    return { status: "error", message: error.message, fieldErrors: error.field ? { [error.field]: [error.message] } : undefined };
  }
  if (error instanceof HttpError && error.status === 400 && categoryIdError(error)) {
    // Kategori ditolak backend (tidak ditemukan atau jenisnya tidak cocok): tampilkan di bawah chip kategori.
    return { status: "error", message: error.message, fieldErrors: { categoryId: [categoryIdError(error)!] } };
  }
  if (error instanceof HttpError) {
    console.error(tag, error.status, error.code, error.message);
    return { status: "error", message: error.status >= 400 && error.status < 500 ? error.message : "Server sedang bermasalah, coba lagi nanti." };
  }
  throw error;
}

/**
 * Server Action untuk layar "Tambah transaksi".
 * Action sengaja dibuat tipis: validasi input, panggil use case, terjemahkan error.
 * Form-nya client component yang memegang nilai sendiri, jadi tidak perlu mengembalikan `values`.
 */
export async function createTransactionAction(_prev: CreateTransactionState, formData: FormData): Promise<CreateTransactionState> {
  const parsed = parseTransactionForm(formData);
  if (!parsed.ok) return parsed.state;
  try {
    await container.createTransaction().execute(parsed.input);
  } catch (error) {
    return toFormState(error, "[createTransactionAction]");
  }
  revalidatePath("/", "layout");
  return { status: "success", savedAt: Date.now() };
}

/**
 * Server Action untuk tombol "Simpan perubahan" di sheet "Ubah transaksi" (/transactions/edit?id=...).
 * `id` diikat di client dengan `.bind(null, id)`. Setelah tersimpan, kembali ke menu Transaksi.
 */
export async function updateTransactionAction(id: string, _prev: CreateTransactionState, formData: FormData): Promise<CreateTransactionState> {
  const parsed = parseTransactionForm(formData);
  if (!parsed.ok) return parsed.state;
  try {
    await container.updateTransaction().execute(String(id), parsed.input);
  } catch (error) {
    return toFormState(error, "[updateTransactionAction]");
  }
  // Daftar transaksi, saldo akun, ringkasan, dan anggaran semuanya bergantung pada transaksi ini.
  revalidatePath("/", "layout");
  redirect("/transactions");
}

/** Server Action untuk "Ya, hapus" di sheet "Ubah transaksi", setelah user mengonfirmasi. */
export async function deleteTransactionAction(id: string): Promise<{ status: "error"; message: string }> {
  try {
    await container.deleteTransaction().execute(String(id));
  } catch (error) {
    if (error instanceof HttpError) {
      console.error("[deleteTransactionAction]", error.status, error.code, error.message);
      return { status: "error", message: error.status === 404 ? "Transaksi ini sudah tidak ada." : "Gagal menghapus transaksi. Coba lagi, ya." };
    }
    throw error;
  }
  revalidatePath("/", "layout");
  redirect("/transactions");
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

export type BulkActionResult = { status: "success"; count: number } | { status: "error"; message: string };

const bulkIdsSchema = z.array(z.string().min(1)).min(1).max(100);

/**
 * Server Action untuk bar aksi di tabel Transaksi desktop, setelah user mencentang beberapa transaksi.
 * `action` "delete" memanggil POST /transactions/bulk-delete; "update" memanggil POST /transactions/bulk-update.
 */
export async function bulkEditTransactionsAction(
  ids: string[],
  action: { kind: "delete" } | { kind: "update"; categoryId?: string; accountId?: string },
): Promise<BulkActionResult> {
  const parsedIds = bulkIdsSchema.safeParse(ids);
  if (!parsedIds.success) return { status: "error", message: "Pilih 1 sampai 100 transaksi dulu, ya." };

  try {
    const bulk = container.bulkEditTransactions();
    const count =
      action?.kind === "delete"
        ? await bulk.delete(parsedIds.data)
        : await bulk.update(parsedIds.data, { categoryId: action?.categoryId || undefined, accountId: action?.accountId || undefined });
    // Daftar, ringkasan, saldo akun, dan anggaran ikut berubah.
    revalidatePath("/", "layout");
    return { status: "success", count };
  } catch (error) {
    if (error instanceof ValidationError) return { status: "error", message: error.message };
    if (error instanceof HttpError) {
      console.error("[bulkEditTransactionsAction]", error.status, error.code, error.message);
      return { status: "error", message: "Server sedang bermasalah, coba lagi nanti." };
    }
    throw error;
  }
}

