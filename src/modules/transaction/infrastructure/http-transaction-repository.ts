import type { HttpClient } from "@/shared/infrastructure/http/http-client";
import type { NewTransaction, Transaction } from "../domain/transaction";
import type { TransactionFilter, TransactionRepository } from "../domain/transaction-repository";
import {
  toCreateTransactionBody,
  toTransaction,
  transactionDtoSchema,
  transactionListDtoSchema,
} from "./transaction-dto";

/** Implementasi repository yang memanggil backend API (dipakai saat DATA_SOURCE=api). */
export class HttpTransactionRepository implements TransactionRepository {
  constructor(private readonly http: HttpClient) {}

  async list(filter: TransactionFilter = {}): Promise<Transaction[]> {
    const dtos = await this.http.request("/transactions", {
      query: {
        from: filter.from?.toISOString(),
        to: filter.to?.toISOString(),
        type: filter.type,
      },
      schema: transactionListDtoSchema,
    });
    return dtos.map(toTransaction);
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
