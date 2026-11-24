import { afterEach, describe, expect, it, vi } from "vitest";
import { HttpClient } from "@/shared/infrastructure/http/http-client";
import { HttpError } from "@/shared/infrastructure/http/http-error";
import { HttpTransactionRepository } from "./http-transaction-repository";

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}

function setup(fetchImpl: typeof fetch) {
  const fetchMock = vi.fn(fetchImpl);
  vi.stubGlobal("fetch", fetchMock);
  const http = new HttpClient({
    baseUrl: "https://api.example.test/api/v1",
    timeoutMs: 1_000,
    getAccessToken: async () => "token-123",
  });
  return { fetchMock, repo: new HttpTransactionRepository(http) };
}

const firstPage = { limit: 20 };

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("HttpTransactionRepository", () => {
  it("memanggil GET /transactions dengan filter dan halaman, lalu memetakan DTO dan next_cursor", async () => {
    const { fetchMock, repo } = setup(async () =>
      jsonResponse({
        data: [
          {
            id: "trx_1",
            type: "expense",
            amount: 64_000,
            category: "Transportasi",
            note: null,
            occurred_at: "2026-11-06T02:00:00.000Z",
          },
        ],
        page: { limit: 20, next_cursor: "eyJvIjoiMjAyNiJ9" },
      }),
    );

    const result = await repo.list(
      { from: new Date("2026-11-01T00:00:00.000Z"), type: "expense", q: "gojek", category: "Transportasi" },
      { limit: 20, cursor: "abc" },
    );

    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).toBe(
      "https://api.example.test/api/v1/transactions?from=2026-11-01T00%3A00%3A00.000Z&type=expense&category=Transportasi&q=gojek&limit=20&cursor=abc",
    );
    expect(new Headers(init?.headers).get("Authorization")).toBe("Bearer token-123");
    expect(result.nextCursor).toBe("eyJvIjoiMjAyNiJ9");
    expect(result.items).toEqual([
      {
        id: "trx_1",
        type: "expense",
        amount: 64_000,
        category: "Transportasi",
        note: undefined,
        occurredAt: new Date("2026-11-06T02:00:00.000Z"),
      },
    ]);
  });

  it("mengirim body snake_case saat POST /transactions", async () => {
    const { fetchMock, repo } = setup(async () =>
      jsonResponse(
        {
          data: {
            id: "trx_2",
            type: "income",
            amount: 2_000_000,
            category: "Freelance",
            note: "Landing page klien",
            occurred_at: "2026-11-08T00:00:00.000Z",
          },
        },
        201,
      ),
    );

    await repo.create({
      type: "income",
      amount: 2_000_000,
      category: "Freelance",
      note: "Landing page klien",
      accountId: "bank",
      occurredAt: new Date("2026-11-08T00:00:00.000Z"),
    });

    const [, init] = fetchMock.mock.calls[0];
    expect(init?.method).toBe("POST");
    expect(JSON.parse(String(init?.body))).toEqual({
      type: "income",
      amount: 2_000_000,
      category: "Freelance",
      note: "Landing page klien",
      account_id: "bank",
      occurred_at: "2026-11-08T00:00:00.000Z",
    });
  });

  it("mengubah error envelope dari API menjadi HttpError", async () => {
    const { repo } = setup(async () =>
      jsonResponse({ error: { code: "VALIDATION_ERROR", message: "Kategori tidak dikenal" } }, 422),
    );

    await expect(repo.list({}, firstPage)).rejects.toMatchObject({
      name: "HttpError",
      status: 422,
      code: "VALIDATION_ERROR",
      message: "Kategori tidak dikenal",
    });
  });

  it("menolak response yang tidak sesuai kontrak", async () => {
    const { repo } = setup(async () => jsonResponse({ data: [{ id: 1 }], page: { limit: 20, next_cursor: null } }));

    await expect(repo.list({}, firstPage)).rejects.toMatchObject({ code: "INVALID_RESPONSE" });
  });

  it("menolak response daftar tanpa objek page", async () => {
    const { repo } = setup(async () => jsonResponse({ data: [] }));

    await expect(repo.list({}, firstPage)).rejects.toMatchObject({ code: "INVALID_RESPONSE" });
  });

  it("memanggil GET /summary dengan from dan to, lalu memetakan DTO ke camelCase", async () => {
    const { fetchMock, repo } = setup(async () =>
      jsonResponse({
        data: {
          total_income: 12_500_000,
          total_expense: 64_000,
          net_cashflow: 12_436_000,
          transaction_count: 2,
          income_count: 1,
          expense_count: 1,
          expense_by_category: [{ category: "Transportasi", amount: 64_000 }],
        },
      }),
    );

    const totals = await repo.summarize({ from: new Date("2026-10-31T17:00:00.000Z"), to: new Date("2026-11-30T16:59:59.999Z") });

    expect(String(fetchMock.mock.calls[0][0])).toBe(
      "https://api.example.test/api/v1/summary?from=2026-10-31T17%3A00%3A00.000Z&to=2026-11-30T16%3A59%3A59.999Z",
    );
    expect(totals).toEqual({
      totalIncome: 12_500_000,
      totalExpense: 64_000,
      netCashflow: 12_436_000,
      transactionCount: 2,
      incomeCount: 1,
      expenseCount: 1,
      expenseByCategory: [{ category: "Transportasi", amount: 64_000 }],
    });
  });

  it("mengembalikan HttpError status 0 saat server tidak bisa dihubungi", async () => {
    const { repo } = setup(async () => {
      throw new TypeError("fetch failed");
    });

    const error = await repo.list({}, firstPage).catch((e: unknown) => e);
    expect(error).toBeInstanceOf(HttpError);
    expect(error).toMatchObject({ status: 0, code: "NETWORK_ERROR" });
  });
});
