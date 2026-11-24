import { afterEach, describe, expect, it, vi } from "vitest";
import { ValidationError } from "@/shared/domain/errors";
import { HttpClient } from "@/shared/infrastructure/http/http-client";
import { HttpAccountRepository } from "./http-account-repository";

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}

function setup(fetchImpl: typeof fetch) {
  const fetchMock = vi.fn(fetchImpl);
  vi.stubGlobal("fetch", fetchMock);
  const http = new HttpClient({ baseUrl: "https://api.example.test/api/v1", timeoutMs: 1_000, getAccessToken: async () => "token-123" });
  return { fetchMock, repo: new HttpAccountRepository(http) };
}

afterEach(() => {
  vi.unstubAllGlobals();
});

const bcaDto = { id: "acc_1", name: "BCA", kind: "bank", opening_balance: 2_000_000, balance: 13_000_000, created_at: "2026-11-24T03:00:00.000Z" };

describe("HttpAccountRepository", () => {
  it("GET /accounts memetakan opening_balance dan balance", async () => {
    const { fetchMock, repo } = setup(async () => jsonResponse({ data: [bcaDto], page: { limit: 100, next_cursor: null } }));

    const page = await repo.list({ limit: 100 });

    expect(String(fetchMock.mock.calls[0][0])).toBe("https://api.example.test/api/v1/accounts?limit=100");
    expect(page).toEqual({ items: [{ id: "acc_1", name: "BCA", kind: "bank", openingBalance: 2_000_000, balance: 13_000_000 }], nextCursor: null });
  });

  it("POST /accounts mengirim body snake_case", async () => {
    const { fetchMock, repo } = setup(async () => jsonResponse({ data: { ...bcaDto, balance: 2_000_000 } }, 201));

    await repo.create({ name: "BCA", kind: "bank", openingBalance: 2_000_000 });

    expect(JSON.parse(String(fetchMock.mock.calls[0][1]?.body))).toEqual({ name: "BCA", kind: "bank", opening_balance: 2_000_000 });
  });

  it("409 ACCOUNT_ALREADY_EXISTS dan 400 saldo menjadi ValidationError di field yang sesuai", async () => {
    const { repo } = setup(async () =>
      jsonResponse({ error: { code: "ACCOUNT_ALREADY_EXISTS", message: "Akun BCA sudah ada", details: { fieldErrors: { name: ["Akun BCA sudah ada"] } } } }, 409),
    );
    const duplicate = await repo.create({ name: "BCA", kind: "bank", openingBalance: 0 }).catch((e: unknown) => e);
    expect(duplicate).toBeInstanceOf(ValidationError);
    expect(duplicate).toMatchObject({ field: "name", message: "Akun BCA sudah ada" });

    vi.unstubAllGlobals();
    const { repo: repo2 } = setup(async () =>
      jsonResponse(
        { error: { code: "VALIDATION_ERROR", message: "Saldo awal harus bilangan bulat", details: { fieldErrors: { opening_balance: ["Saldo awal harus bilangan bulat"] } } } },
        400,
      ),
    );
    const badBalance = await repo2.create({ name: "Dompet", kind: "cash", openingBalance: 0 }).catch((e: unknown) => e);
    expect(badBalance).toMatchObject({ field: "openingBalance" });
  });
});
