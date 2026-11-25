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
            category_id: "cat_expense_transportasi",
            category: "Transportasi",
            note: null,
            occurred_at: "2026-11-06T02:00:00.000Z",
          },
        ],
        page: { limit: 20, next_cursor: "eyJvIjoiMjAyNiJ9" },
      }),
    );

    const result = await repo.list(
      { from: new Date("2026-11-01T00:00:00.000Z"), type: "expense", q: "gojek", categoryId: "cat_expense_transportasi" },
      { limit: 20, cursor: "abc" },
    );

    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).toBe(
      "https://api.example.test/api/v1/transactions?from=2026-11-01T00%3A00%3A00.000Z&type=expense&category_id=cat_expense_transportasi&q=gojek&limit=20&cursor=abc",
    );
    expect(new Headers(init?.headers).get("Authorization")).toBe("Bearer token-123");
    expect(result.nextCursor).toBe("eyJvIjoiMjAyNiJ9");
    expect(result.items).toEqual([
      {
        id: "trx_1",
        type: "expense",
        amount: 64_000,
        categoryId: "cat_expense_transportasi",
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
            category_id: "cat_income_freelance",
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
      categoryId: "cat_income_freelance",
      note: "Landing page klien",
      accountId: "bank",
      occurredAt: new Date("2026-11-08T00:00:00.000Z"),
    });

    const [, init] = fetchMock.mock.calls[0];
    expect(init?.method).toBe("POST");
    expect(JSON.parse(String(init?.body))).toEqual({
      type: "income",
      amount: 2_000_000,
      category_id: "cat_income_freelance",
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
          expense_by_category: [{ category_id: "cat_expense_transportasi", category: "Transportasi", amount: 64_000 }],
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
      expenseByCategory: [{ categoryId: "cat_expense_transportasi", category: "Transportasi", amount: 64_000 }],
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

describe("HttpTransactionRepository ubah dan hapus", () => {
  const dto = {
    id: "trx_9",
    type: "expense",
    amount: 70_000,
    category_id: "cat_expense_transportasi",
    category: "Transportasi",
    note: "Gojek",
    account_id: "acc_1",
    occurred_at: "2026-11-06T02:00:00.000Z",
  };

  it("findById memanggil GET /transactions/:id, dan 404 menjadi null", async () => {
    const { repo } = setup(async (input) =>
      String(input).endsWith("trx_9") ? jsonResponse({ data: dto }) : jsonResponse({ error: { code: "NOT_FOUND", message: "Data Tidak ditemukan" } }, 404),
    );
    expect(await repo.findById("trx_9")).toMatchObject({ id: "trx_9", amount: 70_000, accountId: "acc_1" });
    expect(await repo.findById("trx_milik_orang_lain")).toBeNull();
  });

  it("update mengirim PATCH dengan semua field dalam snake_case", async () => {
    const { fetchMock, repo } = setup(async () => jsonResponse({ data: dto }));

    await repo.update("trx_9", {
      type: "expense",
      amount: 70_000,
      categoryId: "cat_expense_transportasi",
      accountId: "acc_1",
      note: "Gojek",
      occurredAt: new Date("2026-11-06T02:00:00.000Z"),
    });

    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).toBe("https://api.example.test/api/v1/transactions/trx_9");
    expect(init?.method).toBe("PATCH");
    expect(JSON.parse(String(init?.body))).toEqual({
      type: "expense",
      amount: 70_000,
      category_id: "cat_expense_transportasi",
      note: "Gojek",
      account_id: "acc_1",
      occurred_at: "2026-11-06T02:00:00.000Z",
    });
  });

  it("delete mengirim DELETE dan menerima 204 tanpa body", async () => {
    const { fetchMock, repo } = setup(async () => new Response(null, { status: 204 }));
    await expect(repo.delete("trx_9")).resolves.toBeUndefined();
    expect(fetchMock.mock.calls[0][1]?.method).toBe("DELETE");
  });
});

describe("HttpTransactionRepository aksi massal", () => {
  it("bulkDelete mengirim { ids } dan mengembalikan jumlah yang dihapus", async () => {
    const { fetchMock, repo } = setup(async () => jsonResponse({ data: { deleted: 2 } }));
    expect(await repo.bulkDelete(["trx_1", "trx_2"])).toBe(2);
    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).toBe("https://api.example.test/api/v1/transactions/bulk-delete");
    expect(JSON.parse(String(init?.body))).toEqual({ ids: ["trx_1", "trx_2"] });
  });

  it("bulkUpdate mengirim changes dalam snake_case", async () => {
    const { fetchMock, repo } = setup(async () => jsonResponse({ data: { updated: 2 } }));
    expect(await repo.bulkUpdate(["trx_1", "trx_2"], { accountId: "acc_1" })).toBe(2);
    expect(JSON.parse(String(fetchMock.mock.calls[0][1]?.body))).toEqual({ ids: ["trx_1", "trx_2"], changes: { account_id: "acc_1" } });
  });

  it("404 dan 400 menjadi ValidationError dengan pesan dari backend", async () => {
    const { repo } = setup(async () =>
      jsonResponse({ error: { code: "NOT_FOUND", message: "Sebagian transaksi tidak ditemukan. Tidak ada yang diubah." } }, 404),
    );
    await expect(repo.bulkDelete(["trx_1"])).rejects.toMatchObject({ name: "ValidationError", message: "Sebagian transaksi tidak ditemukan. Tidak ada yang diubah." });

    vi.unstubAllGlobals();
    const { repo: repo2 } = setup(async () =>
      jsonResponse(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: "Data request tidak valid",
            details: { fieldErrors: { category_id: ["Kategori Belanja tidak bisa dipakai untuk pemasukan"] } },
          },
        },
        400,
      ),
    );
    await expect(repo2.bulkUpdate(["trx_1"], { categoryId: "cat_expense_belanja" })).rejects.toMatchObject({
      message: "Kategori Belanja tidak bisa dipakai untuk pemasukan",
    });
  });
});
