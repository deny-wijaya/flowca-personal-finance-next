import { z } from "zod";
import { TRANSACTION_TYPES, type NewTransaction, type Transaction } from "../domain/transaction";

/**
 * Bentuk data transaksi sesuai kontrak backend API (snake_case, tanggal ISO string).
 * Kalau backend mengubah format, cukup ubah file ini. Domain dan UI tidak ikut berubah.
 */
export const transactionDtoSchema = z.object({
  id: z.string(),
  type: z.enum(TRANSACTION_TYPES),
  amount: z.number().int(),
  category: z.string(),
  note: z.string().nullish(),
  account_id: z.string().nullish(),
  occurred_at: z.iso.datetime({ offset: true }),
});

export type TransactionDto = z.infer<typeof transactionDtoSchema>;

export const transactionListDtoSchema = z.array(transactionDtoSchema);

export function toTransaction(dto: TransactionDto): Transaction {
  return {
    id: dto.id,
    type: dto.type,
    amount: dto.amount,
    category: dto.category,
    note: dto.note ?? undefined,
    accountId: dto.account_id ?? undefined,
    occurredAt: new Date(dto.occurred_at),
  };
}

export function toCreateTransactionBody(input: NewTransaction) {
  return {
    type: input.type,
    amount: input.amount,
    category: input.category,
    note: input.note ?? null,
    account_id: input.accountId ?? null,
    occurred_at: input.occurredAt.toISOString(),
  };
}
