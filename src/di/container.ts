import "server-only";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { GetAccountBalances } from "@/modules/account/application/get-account-balances";
import { InMemoryAccountRepository } from "@/modules/account/infrastructure/in-memory-account-repository";
import { AuthUseCases } from "@/modules/auth/application/auth-use-cases";
import type { AuthGateway } from "@/modules/auth/domain/auth-gateway";
import { HttpAuthGateway } from "@/modules/auth/infrastructure/http-auth-gateway";
import { MockAuthGateway } from "@/modules/auth/infrastructure/mock-auth-gateway";
import { GetBudgetOverview } from "@/modules/budget/application/get-budget-overview";
import { InMemoryBudgetRepository } from "@/modules/budget/infrastructure/in-memory-budget-repository";
import { ParseQuickEntry, ReadReceipt, SaveQuickDrafts } from "@/modules/quick-add/application/quick-add-use-cases";
import { MockReceiptReader, RuleBasedQuickEntryParser } from "@/modules/quick-add/infrastructure/rule-based-quick-entry-parser";
import { CreateCategory } from "@/modules/transaction/application/create-category";
import { CreateTransaction } from "@/modules/transaction/application/create-transaction";
import { GetMonthlySummary } from "@/modules/transaction/application/get-monthly-summary";
import { ListCategories } from "@/modules/transaction/application/list-categories";
import { ListTransactions } from "@/modules/transaction/application/list-transactions";
import type { CategoryRepository } from "@/modules/transaction/domain/category-repository";
import { HttpCategoryRepository } from "@/modules/transaction/infrastructure/http-category-repository";
import { InMemoryCategoryRepository } from "@/modules/transaction/infrastructure/in-memory-category-repository";
import type { TransactionRepository } from "@/modules/transaction/domain/transaction-repository";
import { HttpTransactionRepository } from "@/modules/transaction/infrastructure/http-transaction-repository";
import {
  createSeedTransactions,
  InMemoryTransactionRepository,
} from "@/modules/transaction/infrastructure/in-memory-transaction-repository";
import { env } from "@/shared/config/env";
import { HttpClient } from "@/shared/infrastructure/http/http-client";
import { createAccessTokenCookie } from "@/shared/infrastructure/session/access-token-cookie";

/**
 * Composition root: satu-satunya tempat yang memilih implementasi konkret.
 * Ganti DATA_SOURCE=mock ke DATA_SOURCE=api di .env.local, dan transaksi
 * otomatis memakai backend tanpa mengubah use case maupun komponen.
 *
 * Auth: AUTH_MODE=api membuat register, login email, dan keluar memanggil backend.
 * Token disimpan di cookie httpOnly dan dikirim ke backend di setiap request lewat HttpClient.
 * Akun, anggaran, dan parser Catat cepat belum punya endpoint backend,
 * jadi untuk sementara selalu memakai implementasi in-memory / tiruan.
 */

// Disimpan di globalThis supaya data mock tidak ter-reset setiap hot reload saat development.
const globalForMock = globalThis as unknown as {
  mockTransactionRepository?: InMemoryTransactionRepository;
  mockCategoryRepository?: InMemoryCategoryRepository;
};

const accessTokenCookie = createAccessTokenCookie({ secure: env.NODE_ENV === "production" });

function getHttpClient() {
  return new HttpClient({
    baseUrl: env.API_BASE_URL!,
    timeoutMs: env.API_TIMEOUT_MS,
    // Token dari cookie httpOnly dikirim sebagai header Authorization: Bearer <token>.
    getAccessToken: () => accessTokenCookie.read(),
    // Token ditolak backend: hapus cookie lewat Route Handler /auth/expired, lalu ke Login.
    onUnauthorized: () => redirect("/auth/expired"),
    // IP browser dari request yang masuk ke Next (alamat pertama di X-Forwarded-For), diteruskan ke backend.
    getClientIp: async () => (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() || undefined,
  });
}

function getTransactionRepository(): TransactionRepository {
  if (env.DATA_SOURCE === "api") {
    return new HttpTransactionRepository(getHttpClient());
  }
  globalForMock.mockTransactionRepository ??= new InMemoryTransactionRepository(createSeedTransactions(), getMockCategoryRepository());
  return globalForMock.mockTransactionRepository;
}

function getMockCategoryRepository(): InMemoryCategoryRepository {
  globalForMock.mockCategoryRepository ??= new InMemoryCategoryRepository();
  return globalForMock.mockCategoryRepository;
}

function getCategoryRepository(): CategoryRepository {
  return env.DATA_SOURCE === "api" ? new HttpCategoryRepository(getHttpClient()) : getMockCategoryRepository();
}

const accountRepository = new InMemoryAccountRepository();
const budgetRepository = new InMemoryBudgetRepository();
const mockAuthGateway = new MockAuthGateway();

function getAuthGateway(): AuthGateway {
  return env.AUTH_MODE === "api" ? new HttpAuthGateway(getHttpClient(), mockAuthGateway, accessTokenCookie) : mockAuthGateway;
}
const quickEntryParser = new RuleBasedQuickEntryParser();
const receiptReader = new MockReceiptReader();

export const container = {
  /** true selama autentikasi masih tiruan; dipakai untuk menampilkan pita MODE PROTOTIPE. */
  isPrototypeMode: () => env.AUTH_MODE === "mock",

  listTransactions: () => new ListTransactions(getTransactionRepository()),
  createTransaction: () => new CreateTransaction(getTransactionRepository()),
  getMonthlySummary: () => new GetMonthlySummary(getTransactionRepository()),
  listCategories: () => new ListCategories(getCategoryRepository()),
  createCategory: () => new CreateCategory(getCategoryRepository()),

  getAccountBalances: () => new GetAccountBalances(accountRepository, getTransactionRepository()),
  getBudgetOverview: () => new GetBudgetOverview(budgetRepository, getTransactionRepository()),

  auth: () => new AuthUseCases(getAuthGateway()),

  parseQuickEntry: () => new ParseQuickEntry(quickEntryParser),
  readReceipt: () => new ReadReceipt(receiptReader),
  saveQuickDrafts: () => new SaveQuickDrafts(new CreateTransaction(getTransactionRepository())),
};
