import { z } from "zod";
import { TRANSACTION_TYPES, type NewTransaction, type Transaction } from "../domain/transaction";
import type { TransactionTotals } from "../domain/transaction-repository";

/**
 * Bentuk data transaksi sesuai kontrak backend API (snake_case, tanggal ISO string).
 * Kalau backend mengubah format, cukup ubah file ini. Domain dan UI tidak ikut berubah.
 */
export const transactionDtoSchema = z.object({
  id: z.string(),
  type: z.enum(TRANSACTION_TYPES),
  amount: z.number().int(),
  category_id: z.string(),
  category: z.string(),
  note: z.string().nullish(),
  account_id: z.string().nullish(),
  occurred_at: z.iso.datetime({ offset: true }),
});

export type TransactionDto = z.infer<typeof transactionDtoSchema>;

/** Response GET /summary (API-CONTRACT.md bagian 4.5). */
export const summaryDtoSchema = z.object({
  total_income: z.number().int(),
  total_expense: z.number().int(),
  net_cashflow: z.number().int(),
  transaction_count: z.number().int(),
  income_count: z.number().int(),
  expense_count: z.number().int(),
  expense_by_category: z.array(z.object({ category_id: z.string(), category: z.string(), amount: z.number().int() })),
});

export function toTransactionTotals(dto: z.infer<typeof summaryDtoSchema>): TransactionTotals {
  return {
    totalIncome: dto.total_income,
    totalExpense: dto.total_expense,
    netCashflow: dto.net_cashflow,
    transactionCount: dto.transaction_count,
    incomeCount: dto.income_count,
    expenseCount: dto.expense_count,
    expenseByCategory: dto.expense_by_category.map((item) => ({ categoryId: item.category_id, category: item.category, amount: item.amount })),
  };
}

export function toTransaction(dto: TransactionDto): Transaction {
  return {
    id: dto.id,
    type: dto.type,
    amount: dto.amount,
    categoryId: dto.category_id,
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
    category_id: input.categoryId,
    note: input.note ?? null,
    account_id: input.accountId ?? null,
    occurred_at: input.occurredAt.toISOString(),
  };
}
