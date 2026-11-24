"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { container } from "@/di/container";
import { TRANSACTION_TYPES } from "@/modules/transaction/domain/transaction";
import { ValidationError } from "@/shared/domain/errors";
import type { QuickDraft } from "../domain/quick-draft";
import { toDraftVM, type DraftVM } from "./view-models/draft-view-model";

export type QuickReply = { kind: "draft"; drafts: QuickDraft[]; view: DraftVM; intro: string; note?: string } | { kind: "not-understood"; text: string };

async function loadAccounts() {
  const { accounts } = await container.getAccountBalances().execute();
  return accounts;
}

const NO_ACCOUNT_REPLY: QuickReply = {
  kind: "not-understood",
  text: "Kamu belum punya akun untuk mencatat transaksi. Tambahkan dulu di menu Akun, ya.",
};

/**
 * Parser hanya menebak JENIS akun dari kalimat ("pakai qris" berarti bank, selain itu tunai).
 * Di sini tebakan itu diganti dengan akun milik user: akun pertama dengan jenis yang cocok,
 * atau akun pertama kalau tidak ada yang cocok.
 */
function withUserAccounts(drafts: QuickDraft[], accounts: Awaited<ReturnType<typeof loadAccounts>>): QuickDraft[] {
  return drafts.map((draft) => {
    const match = accounts.find((account) => account.kind === draft.accountId) ?? accounts[0];
    return { ...draft, accountId: match?.id ?? draft.accountId };
  });
}

/** Kalimat bebas -> draf transaksi yang perlu dikonfirmasi. */
export async function parseQuickEntryAction(text: string): Promise<QuickReply> {
  const drafts = await container.parseQuickEntry().execute(String(text).slice(0, 500));
  if (drafts.length === 0) {
    return { kind: "not-understood", text: "Hmm, aku belum menangkap nominalnya. Berapa jumlahnya? Contoh: “bensin 30 ribu tunai”." };
  }
  const accounts = await loadAccounts();
  if (accounts.length === 0) return NO_ACCOUNT_REPLY;
  const resolved = withUserAccounts(drafts, accounts);
  return {
    kind: "draft",
    drafts: resolved,
    view: toDraftVM(resolved, new Map(accounts.map((account) => [account.id, account.name]))),
    intro: drafts.length > 1 ? `Aku pisahkan jadi ${drafts.length} transaksi. Cek dulu, ya:` : "Ini yang aku tangkap. Sudah benar?",
  };
}

/** Foto nota -> satu draf pengeluaran (pembaca nota masih tiruan). */
export async function readReceiptAction(): Promise<QuickReply> {
  const reading = await container.readReceipt().execute();
  const accounts = await loadAccounts();
  if (accounts.length === 0) return NO_ACCOUNT_REPLY;
  const drafts = withUserAccounts([reading.draft], accounts);
  return {
    kind: "draft",
    drafts,
    view: toDraftVM(drafts, new Map(accounts.map((account) => [account.id, account.name]))),
    intro: "Notanya terbaca. Totalnya aku catat sebagai satu pengeluaran:",
    note: reading.note,
  };
}

const draftSchema = z.object({
  name: z.string().min(1).max(200),
  category: z.string().min(1),
  accountId: z.string().min(1),
  type: z.enum(TRANSACTION_TYPES),
  amount: z.number().int().positive(),
  day: z.enum(["today", "yesterday"]),
});

/** Simpan draf yang sudah dikonfirmasi pengguna. */
export async function saveQuickDraftsAction(drafts: QuickDraft[]): Promise<{ ok: true } | { ok: false; message: string }> {
  const parsed = z.array(draftSchema).min(1).max(20).safeParse(drafts);
  if (!parsed.success) return { ok: false, message: "Draf tidak valid. Coba catat ulang, ya." };
  try {
    await container.saveQuickDrafts().execute(parsed.data);
  } catch (error) {
    if (error instanceof ValidationError) return { ok: false, message: error.message };
    throw error;
  }
  revalidatePath("/", "layout");
  return { ok: true };
}
