"use server";

import { revalidatePath } from "next/cache";
import { container } from "@/di/container";
import { ValidationError } from "@/shared/domain/errors";
import { HttpError } from "@/shared/infrastructure/http/http-error";
import { parseThousands } from "@/shared/lib/format";

export type BudgetActionResult = { status: "success" } | { status: "error"; message: string };

/**
 * Server Action untuk menyimpan anggaran satu kategori di menu Anggaran, dari kotak ubah nominal di kartu
 * anggaran maupun dari "Tambah anggaran kategori" (PUT /budgets/:category_id).
 */
export async function setBudgetAction(categoryId: string, amount: string): Promise<BudgetActionResult> {
  if (typeof categoryId !== "string" || !categoryId) return { status: "error", message: "Pilih kategorinya dulu, ya." };
  try {
    await container.setBudget().execute(categoryId, parseThousands(String(amount ?? "")));
  } catch (error) {
    return toError(error, "[setBudgetAction]");
  }
  // Dashboard (kartu Sisa anggaran) dan menu Anggaran ikut diperbarui.
  revalidatePath("/", "layout");
  return { status: "success" };
}

/** Server Action untuk tombol Hapus di kartu anggaran. Transaksi di kategori itu tidak ikut terhapus. */
export async function deleteBudgetAction(categoryId: string): Promise<BudgetActionResult> {
  try {
    await container.deleteBudget().execute(String(categoryId));
  } catch (error) {
    return toError(error, "[deleteBudgetAction]");
  }
  revalidatePath("/", "layout");
  return { status: "success" };
}

function toError(error: unknown, tag: string): BudgetActionResult {
  if (error instanceof ValidationError) return { status: "error", message: error.message };
  if (error instanceof HttpError) {
    console.error(tag, error.status, error.code, error.message);
    return { status: "error", message: "Server sedang bermasalah, coba lagi nanti." };
  }
  throw error;
}
