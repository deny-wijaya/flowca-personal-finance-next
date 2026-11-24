import { z } from "zod";
import { ValidationError } from "@/shared/domain/errors";
import type { Page, PageRequest } from "@/shared/domain/pagination";
import type { HttpClient } from "@/shared/infrastructure/http/http-client";
import { HttpError } from "@/shared/infrastructure/http/http-error";
import type { NewTransaction, Transaction } from "../domain/transaction";
import type { BulkChanges, DateRange, TransactionFilter, TransactionRepository, TransactionTotals } from "../domain/transaction-repository";
import { summaryDtoSchema, toCreateTransactionBody, toTransaction, toTransactionTotals, transactionDtoSchema } from "./transaction-dto";

/** Implementasi repository yang memanggil backend API (dipakai saat DATA_SOURCE=api). */
export class HttpTransactionRepository implements TransactionRepository {
  constructor(private readonly http: HttpClient) {}

  /** GET /transactions (API-CONTRACT.md bagian 4.4), satu halaman per request. */
  async list(filter: TransactionFilter, page: PageRequest): Promise<Page<Transaction>> {
    const result = await this.http.requestPage("/transactions", {
      query: {
        from: filter.from?.toISOString(),
        to: filter.to?.toISOString(),
        type: filter.type,
        category_id: filter.categoryId,
        account_id: filter.accountId,
        q: filter.q,
        limit: page.limit,
        cursor: page.cursor,
      },
      schema: transactionDtoSchema,
    });
    return { items: result.items.map(toTransaction), nextCursor: result.nextCursor };
  }

  /** GET /summary (API-CONTRACT.md bagian 4.5). Penjumlahannya dikerjakan database di backend. */
  async summarize(range: DateRange): Promise<TransactionTotals> {
    const dto = await this.http.request("/summary", {
      query: { from: range.from.toISOString(), to: range.to.toISOString() },
      schema: summaryDtoSchema,
    });
    return toTransactionTotals(dto);
  }

  /** GET /transactions/:id. Backend membalas 404 untuk transaksi yang tidak ada maupun milik user lain. */
  async findById(id: string): Promise<Transaction | null> {
    try {
      return toTransaction(await this.http.request(`/transactions/${encodeURIComponent(id)}`, { schema: transactionDtoSchema }));
    } catch (error) {
      if (error instanceof HttpError && error.status === 404) return null;
      throw error;
    }
  }

  /** PATCH /transactions/:id dengan semua field, supaya hasil akhirnya sama persis dengan isi form. */
  async update(id: string, input: NewTransaction): Promise<Transaction> {
    const dto = await this.http.request(`/transactions/${encodeURIComponent(id)}`, {
      method: "PATCH",
      body: toCreateTransactionBody(input),
      schema: transactionDtoSchema,
    });
    return toTransaction(dto);
  }

  /** DELETE /transactions/:id, dibalas 204 tanpa body. */
  async delete(id: string): Promise<void> {
    await this.http.requestNoContent(`/transactions/${encodeURIComponent(id)}`, { method: "DELETE" });
  }

  /** POST /transactions/bulk-delete (API-CONTRACT.md bagian 4.11). */
  async bulkDelete(ids: string[]): Promise<number> {
    try {
      const result = await this.http.request("/transactions/bulk-delete", { method: "POST", body: { ids }, schema: z.object({ deleted: z.number().int() }) });
      return result.deleted;
    } catch (error) {
      throw toBulkError(error);
    }
  }

  /** POST /transactions/bulk-update (API-CONTRACT.md bagian 4.11). */
  async bulkUpdate(ids: string[], changes: BulkChanges): Promise<number> {
    try {
      const result = await this.http.request("/transactions/bulk-update", {
        method: "POST",
        body: { ids, changes: { category_id: changes.categoryId, account_id: changes.accountId } },
        schema: z.object({ updated: z.number().int() }),
      });
      return result.updated;
    } catch (error) {
      throw toBulkError(error);
    }
  }

  async create(input: NewTransaction): Promise<Transaction> {
    const dto = await this.http.request("/transactions", {
      method: "POST",
      body: toCreateTransactionBody(input),
      schema: transactionDtoSchema,
    });
    return toTransaction(dto);
  }
}

/**
 * 404 (ada transaksi yang sudah tidak ada) dan 400 (kategori tidak cocok, akun tidak ditemukan) dari aksi massal
 * menjadi ValidationError, supaya pesannya tampil di bar aksi tabel Transaksi.
 */
function toBulkError(error: unknown): unknown {
  if (!(error instanceof HttpError) || (error.status !== 400 && error.status !== 404)) return error;
  const fieldErrors = z.object({ fieldErrors: z.record(z.string(), z.array(z.string())) }).safeParse(error.details);
  const first = fieldErrors.success ? Object.values(fieldErrors.data.fieldErrors)[0]?.[0] : undefined;
  return new ValidationError(first ?? error.message, "form");
}
