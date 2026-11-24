import { afterEach, describe, expect, it, vi } from "vitest";
import { ValidationError } from "@/shared/domain/errors";
import { HttpClient } from "@/shared/infrastructure/http/http-client";
import { HttpCategoryRepository } from "./http-category-repository";

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}

function setup(fetchImpl: typeof fetch) {
  const fetchMock = vi.fn(fetchImpl);
  vi.stubGlobal("fetch", fetchMock);
  const http = new HttpClient({ baseUrl: "https://api.example.test/api/v1", timeoutMs: 1_000, getAccessToken: async () => "token-123" });
  return { fetchMock, repo: new HttpCategoryRepository(http) };
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("HttpCategoryRepository", () => {
  it("memanggil GET /categories dengan type dan halaman, lalu memetakan is_default", async () => {
    const { fetchMock, repo } = setup(async () =>
      jsonResponse({
        data: [{ id: "cat_income_gaji", name: "Gaji", type: "income", is_default: true }],
        page: { limit: 100, next_cursor: null },
      }),
    );

    const page = await repo.list({ type: "income" }, { limit: 100 });

    expect(String(fetchMock.mock.calls[0][0])).toBe("https://api.example.test/api/v1/categories?type=income&limit=100");
    expect(page).toEqual({ items: [{ id: "cat_income_gaji", name: "Gaji", type: "income", isDefault: true }], nextCursor: null });
  });

  it("POST /categories mengirim { name, type } dan mengembalikan kategori baru", async () => {
    const { fetchMock, repo } = setup(async () =>
      jsonResponse({ data: { id: "cat_123", name: "Kos", type: "expense", is_default: false } }, 201),
    );

    const created = await repo.create({ name: "Kos", type: "expense" });

    expect(JSON.parse(String(fetchMock.mock.calls[0][1]?.body))).toEqual({ name: "Kos", type: "expense" });
    expect(created).toEqual({ id: "cat_123", name: "Kos", type: "expense", isDefault: false });
  });

  it("409 CATEGORY_ALREADY_EXISTS menjadi ValidationError di field name dengan pesan dari backend", async () => {
    const { repo } = setup(async () =>
      jsonResponse(
        { error: { code: "CATEGORY_ALREADY_EXISTS", message: "Kategori Kos sudah ada", details: { fieldErrors: { name: ["Kategori Kos sudah ada"] } } } },
        409,
      ),
    );

    const error = await repo.create({ name: "Kos", type: "expense" }).catch((e: unknown) => e);

    expect(error).toBeInstanceOf(ValidationError);
    expect(error).toMatchObject({ field: "name", message: "Kategori Kos sudah ada" });
  });
});
