import "server-only";
import { GetAccountBalances } from "@/modules/account/application/get-account-balances";
import { InMemoryAccountRepository } from "@/modules/account/infrastructure/in-memory-account-repository";
import { AuthUseCases } from "@/modules/auth/application/auth-use-cases";
import { MockAuthGateway } from "@/modules/auth/infrastructure/mock-auth-gateway";
import { GetBudgetOverview } from "@/modules/budget/application/get-budget-overview";
import { InMemoryBudgetRepository } from "@/modules/budget/infrastructure/in-memory-budget-repository";
import { ParseQuickEntry, ReadReceipt, SaveQuickDrafts } from "@/modules/quick-add/application/quick-add-use-cases";
import { MockReceiptReader, RuleBasedQuickEntryParser } from "@/modules/quick-add/infrastructure/rule-based-quick-entry-parser";
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
 * Ganti DATA_SOURCE=mock ke DATA_SOURCE=api di .env.local, dan transaksi
 * otomatis memakai backend tanpa mengubah use case maupun komponen.
 *
 * Akun, anggaran, auth, dan parser Catat cepat belum punya endpoint backend,
 * jadi untuk sementara selalu memakai implementasi in-memory / tiruan.
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

const accountRepository = new InMemoryAccountRepository();
const budgetRepository = new InMemoryBudgetRepository();
const authGateway = new MockAuthGateway();
const quickEntryParser = new RuleBasedQuickEntryParser();
const receiptReader = new MockReceiptReader();

export const container = {
  /** true selama autentikasi masih tiruan; dipakai untuk menampilkan pita MODE PROTOTIPE. */
  isPrototypeMode: () => env.AUTH_MODE === "mock",

  listTransactions: () => new ListTransactions(getTransactionRepository()),
  createTransaction: () => new CreateTransaction(getTransactionRepository()),
  getMonthlySummary: () => new GetMonthlySummary(getTransactionRepository()),

  getAccountBalances: () => new GetAccountBalances(accountRepository, getTransactionRepository()),
  getBudgetOverview: () => new GetBudgetOverview(budgetRepository, getTransactionRepository()),

  auth: () => new AuthUseCases(authGateway),

  parseQuickEntry: () => new ParseQuickEntry(quickEntryParser),
  readReceipt: () => new ReadReceipt(receiptReader),
  saveQuickDrafts: () => new SaveQuickDrafts(new CreateTransaction(getTransactionRepository())),
};
