import type { Page, PageRequest } from "@/shared/domain/pagination";
import type { HttpClient } from "@/shared/infrastructure/http/http-client";
import type { NewTransaction, Transaction } from "../domain/transaction";
import type { DateRange, TransactionFilter, TransactionRepository, TransactionTotals } from "../domain/transaction-repository";
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

  async create(input: NewTransaction): Promise<Transaction> {
    const dto = await this.http.request("/transactions", {
      method: "POST",
      body: toCreateTransactionBody(input),
      schema: transactionDtoSchema,
    });
    return toTransaction(dto);
  }
}
