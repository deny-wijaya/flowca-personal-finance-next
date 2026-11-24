"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { container } from "@/di/container";
import { ValidationError } from "@/shared/domain/errors";
import { HttpError } from "@/shared/infrastructure/http/http-error";
import { parseThousands } from "@/shared/lib/format";
import { ACCOUNT_KINDS } from "../domain/account";

export type CreateAccountState =
  | { status: "idle" }
  | { status: "success"; savedAt: number; name: string }
  | { status: "error"; message: string; fieldErrors?: Record<string, string[] | undefined> };

const formSchema = z.object({
  name: z.string().trim().min(1, "Nama akun wajib diisi").max(40, "Nama akun maksimal 40 karakter"),
  kind: z.enum(ACCOUNT_KINDS, { error: "Pilih jenis akun" }),
  /** "2.000.000" dari MoneyInput. */
  openingBalance: z.string(),
  /** "on" kalau saldo awal adalah utang (kartu kredit), sehingga disimpan negatif. */
  isDebt: z.string().optional(),
});

/** Server Action untuk form "Tambah akun" di menu Akun. */
export async function createAccountAction(_prev: CreateAccountState, formData: FormData): Promise<CreateAccountState> {
  const parsed = formSchema.safeParse({
    name: formData.get("name") ?? "",
    kind: formData.get("kind"),
    openingBalance: String(formData.get("openingBalance") ?? ""),
    isDebt: formData.get("isDebt") ?? undefined,
  });
  if (!parsed.success) {
    return { status: "error", message: "Periksa kembali isian form.", fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }

  const { name, kind, openingBalance, isDebt } = parsed.data;
  const amount = parseThousands(openingBalance);
  try {
    const account = await container.createAccount().execute({ name, kind, openingBalance: isDebt === "on" ? -amount : amount });
    revalidatePath("/", "layout");
    return { status: "success", savedAt: Date.now(), name: account.name };
  } catch (error) {
    if (error instanceof ValidationError) {
      return { status: "error", message: error.message, fieldErrors: { [error.field ?? "name"]: [error.message] } };
    }
    if (error instanceof HttpError) {
      console.error("[createAccountAction]", error.status, error.code, error.message);
      return { status: "error", message: "Server sedang bermasalah, coba lagi nanti." };
    }
    throw error;
  }
}
