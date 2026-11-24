import { afterEach, describe, expect, it, vi } from "vitest";
import { ValidationError } from "@/shared/domain/errors";
import { HttpClient } from "@/shared/infrastructure/http/http-client";
import { HttpBudgetRepository } from "./http-budget-repository";

function jsonResponse(body: unknown, status = 200) {
  return status === 204 ? new Response(null, { status }) : new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}

function setup(fetchImpl: typeof fetch) {
  const fetchMock = vi.fn(fetchImpl);
  vi.stubGlobal("fetch", fetchMock);
  const http = new HttpClient({ baseUrl: "https://api.example.test/api/v1", timeoutMs: 1_000, getAccessToken: async () => "token-123" });
  return { fetchMock, repo: new HttpBudgetRepository(http) };
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("HttpBudgetRepository", () => {
  it("GET /budgets memetakan amount menjadi limit", async () => {
    const { repo } = setup(async () =>
      jsonResponse({ data: [{ category_id: "cat_expense_makanan", category: "Makanan", amount: 1_500_000 }], page: { limit: 100, next_cursor: null } }),
    );
    expect(await repo.list({ limit: 100 })).toEqual({
      items: [{ categoryId: "cat_expense_makanan", category: "Makanan", limit: 1_500_000 }],
      nextCursor: null,
    });
  });

  it("PUT /budgets/:category_id mengirim { amount }", async () => {
    const { fetchMock, repo } = setup(async () => jsonResponse({ data: { category_id: "cat_expense_makanan", category: "Makanan", amount: 2_000_000 } }));

    const budget = await repo.set("cat_expense_makanan", 2_000_000);

    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).toBe("https://api.example.test/api/v1/budgets/cat_expense_makanan");
    expect(init?.method).toBe("PUT");
    expect(JSON.parse(String(init?.body))).toEqual({ amount: 2_000_000 });
    expect(budget.limit).toBe(2_000_000);
  });

  it("400 kategori pemasukan menjadi ValidationError dengan pesan dari backend", async () => {
    const { repo } = setup(async () =>
      jsonResponse(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: "Anggaran hanya untuk kategori pengeluaran",
            details: { fieldErrors: { category_id: ["Anggaran hanya untuk kategori pengeluaran"] } },
          },
        },
        400,
      ),
    );
    const error = await repo.set("cat_income_gaji", 1_000).catch((e: unknown) => e);
    expect(error).toBeInstanceOf(ValidationError);
    expect(error).toMatchObject({ field: "categoryId", message: "Anggaran hanya untuk kategori pengeluaran" });
  });

  it("DELETE yang dibalas 204 tanpa body dianggap berhasil", async () => {
    const { fetchMock, repo } = setup(async () => jsonResponse(null, 204));
    await expect(repo.delete("cat_expense_hiburan")).resolves.toBeUndefined();
    expect(String(fetchMock.mock.calls[0][0])).toBe("https://api.example.test/api/v1/budgets/cat_expense_hiburan");
  });

  it("DELETE yang dibalas 404 (sudah terhapus) tidak dianggap gagal", async () => {
    const { fetchMock, repo } = setup(async () => jsonResponse({ error: { code: "NOT_FOUND", message: "Anggaran untuk kategori ini tidak ditemukan" } }, 404));
    await expect(repo.delete("cat_expense_hiburan")).resolves.toBeUndefined();
    expect(fetchMock.mock.calls[0][1]?.method).toBe("DELETE");
  });
});
