import { categoryInitial, categoryTone } from "@/modules/transaction/presentation/view-models/category-tone";
import type { Direction } from "@/modules/transaction/presentation/view-models/transaction-view-model";
import type { CategoryTileTone } from "@/shared/ui/primitives/category-tile";
import { signedAmount } from "@/shared/lib/format";
import type { QuickDraft } from "../../domain/quick-draft";

export type DraftItemVM = {
  name: string;
  initial: string;
  tone: CategoryTileTone;
  /** "Pengeluaran · Makanan · Tunai · Hari ini" */
  meta: string;
  amount: string;
  direction: Direction;
};

export type DraftVM = {
  items: DraftItemVM[];
  /** "Draf · 2 transaksi · total −Rp 40.000" atau "Draf · perlu konfirmasi" */
  pendingLabel: string;
  saveLabel: string;
};

export function toDraftVM(drafts: QuickDraft[], accountNames: ReadonlyMap<string, string>, { withType = true } = {}): DraftVM {
  const items = drafts.map((draft) => {
    const signed = draft.type === "income" ? draft.amount : -draft.amount;
    const parts = [draft.category, accountNames.get(draft.accountId) ?? draft.accountId, draft.day === "yesterday" ? "Kemarin" : "Hari ini"];
    if (withType) parts.unshift(draft.type === "income" ? "Pemasukan" : "Pengeluaran");
    return {
      name: draft.name,
      initial: categoryInitial(draft.category),
      tone: categoryTone(draft.category),
      meta: parts.join(" · "),
      amount: signedAmount(signed),
      direction: draft.type === "income" ? ("in" as const) : ("out" as const),
    };
  });
  const total = drafts.reduce((sum, draft) => sum + (draft.type === "income" ? draft.amount : -draft.amount), 0);
  const many = drafts.length > 1;
  return {
    items,
    pendingLabel: many ? `Draf · ${drafts.length} transaksi · total ${signedAmount(total)}` : "Draf · perlu konfirmasi",
    saveLabel: many ? "Simpan semua" : "Simpan",
  };
}
