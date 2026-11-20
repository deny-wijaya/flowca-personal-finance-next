import "server-only";
import { CreateTransaction } from "@/modules/transaction/application/create-transaction";
import { GetMonthlySummary } from "@/modules/transaction/application/get-monthly-summary";
import { ListTransactions } from "@/modules/transaction/application/list-transactions";
import type { TransactionRepository } from "@/modules/transaction/domain/transaction-repository";
import { HttpTransactionRepository } from "@/modules/transaction/infrastructure/http-transaction-repository";
import {
  createSeedTransactions,
  InMemoryTransactionRepository,
} from "@/modules/transaction/infrastructure/in-memory-transaction-repository";
import { env } from "@/shared/config/env";
import { HttpClient } from "@/shared/infrastructure/http/http-client";

/**
 * Composition root: satu-satunya tempat yang memilih implementasi konkret.
 * Ganti DATA_SOURCE=mock ke DATA_SOURCE=api di .env.local, dan seluruh app
 * otomatis memakai backend tanpa mengubah use case maupun komponen.
 */

// Disimpan di globalThis supaya data mock tidak ter-reset setiap hot reload saat development.
const globalForMock = globalThis as unknown as { mockTransactionRepository?: InMemoryTransactionRepository };

function getHttpClient() {
  return new HttpClient({
    baseUrl: env.API_BASE_URL!,
    timeoutMs: env.API_TIMEOUT_MS,
    // TODO(auth): isi dengan pembacaan token dari cookie saat fitur login dibuat.
    getAccessToken: async () => undefined,
  });
}

function getTransactionRepository(): TransactionRepository {
  if (env.DATA_SOURCE === "api") {
    return new HttpTransactionRepository(getHttpClient());
  }
  globalForMock.mockTransactionRepository ??= new InMemoryTransactionRepository(createSeedTransactions());
  return globalForMock.mockTransactionRepository;
}

export const container = {
  listTransactions: () => new ListTransactions(getTransactionRepository()),
  createTransaction: () => new CreateTransaction(getTransactionRepository()),
  getMonthlySummary: () => new GetMonthlySummary(getTransactionRepository()),
};
