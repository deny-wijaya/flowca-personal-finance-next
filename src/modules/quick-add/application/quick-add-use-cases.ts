import type { CreateTransaction } from "@/modules/transaction/application/create-transaction";
import type { QuickDraft, QuickEntryParser, ReceiptReader } from "../domain/quick-draft";

export class ParseQuickEntry {
  constructor(private readonly parser: QuickEntryParser) {}

  execute(text: string) {
    const trimmed = text.trim();
    return trimmed ? this.parser.parse(trimmed) : Promise.resolve([]);
  }
}

export class ReadReceipt {
  constructor(private readonly reader: ReceiptReader) {}

  execute() {
    return this.reader.read();
  }
}

/** Menyimpan draf yang sudah dikonfirmasi pengguna lewat use case CreateTransaction. */
export class SaveQuickDrafts {
  constructor(
    private readonly createTransaction: CreateTransaction,
    private readonly now: () => Date = () => new Date(),
  ) {}

  async execute(drafts: QuickDraft[]) {
    const now = this.now();
    const saved = [];
    for (const draft of drafts) {
      const occurredAt = new Date(now);
      if (draft.day === "yesterday") occurredAt.setDate(occurredAt.getDate() - 1);
      saved.push(
        await this.createTransaction.execute({
          type: draft.type,
          amount: draft.amount,
          category: draft.category,
          note: draft.name,
          accountId: draft.accountId,
          occurredAt,
        }),
      );
    }
    return saved;
  }
}
