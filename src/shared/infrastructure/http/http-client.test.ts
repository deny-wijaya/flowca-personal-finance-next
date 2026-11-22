import { afterEach, describe, expect, it, vi } from "vitest";
import { HttpClient } from "./http-client";
import { HttpError } from "./http-error";

function jsonResponse(body: unknown, status: number) {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}

/** Meniru redirect() milik Next, yang menghentikan eksekusi dengan melempar error. */
class RedirectSignal extends Error {}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("HttpClient 401", () => {
  function setup(body: unknown) {
    vi.stubGlobal("fetch", vi.fn(async () => jsonResponse(body, 401)));
    const onUnauthorized = vi.fn((): never => {
      throw new RedirectSignal();
    });
    const http = new HttpClient({ baseUrl: "https://api.example.test/api/v1", timeoutMs: 1_000, onUnauthorized });
    return { http, onUnauthorized };
  }

  it("401 UNAUTHORIZED memanggil onUnauthorized (redirect ke /auth/expired)", async () => {
    const { http, onUnauthorized } = setup({ error: { code: "UNAUTHORIZED", message: "Sesi kamu sudah habis." } });
    await expect(http.request("/transactions", { schema: { safeParse: () => ({}) } as never })).rejects.toThrow(RedirectSignal);
    expect(onUnauthorized).toHaveBeenCalledOnce();
  });

  it("401 INVALID_CREDENTIALS (password salah) tidak memanggil onUnauthorized", async () => {
    const { http, onUnauthorized } = setup({ error: { code: "INVALID_CREDENTIALS", message: "Email atau password salah." } });
    await expect(http.request("/auth/login", { method: "POST", body: {}, schema: { safeParse: () => ({}) } as never })).rejects.toThrow(
      HttpError,
    );
    expect(onUnauthorized).not.toHaveBeenCalled();
  });
});
