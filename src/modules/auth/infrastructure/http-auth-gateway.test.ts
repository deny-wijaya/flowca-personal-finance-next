import { afterEach, describe, expect, it, vi } from "vitest";
import { ValidationError } from "@/shared/domain/errors";
import { HttpClient } from "@/shared/infrastructure/http/http-client";
import { HttpError } from "@/shared/infrastructure/http/http-error";
import type { AccessTokenStore } from "@/shared/infrastructure/session/access-token-cookie";
import { HttpAuthGateway } from "./http-auth-gateway";
import { MockAuthGateway } from "./mock-auth-gateway";

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}

function setup(fetchImpl: typeof fetch) {
  const fetchMock = vi.fn(fetchImpl);
  vi.stubGlobal("fetch", fetchMock);
  const http = new HttpClient({ baseUrl: "https://api.example.test/api/v1", timeoutMs: 1_000 });
  // Penyimpan token palsu: mencatat apa yang disimpan, tanpa cookie sungguhan.
  const saved: { token?: string; maxAge?: number; cleared: boolean } = { cleared: false };
  const tokens: AccessTokenStore = {
    read: async () => saved.token,
    save: async (token, maxAge) => {
      saved.token = token;
      saved.maxAge = maxAge;
    },
    clear: async () => {
      saved.cleared = true;
    },
  };
  return { fetchMock, saved, gateway: new HttpAuthGateway(http, new MockAuthGateway({ latencyMs: 0 }), tokens) };
}

afterEach(() => {
  vi.unstubAllGlobals();
});

const rani = { name: "Rani Putri", email: "rani@email.com", password: "rahasia123" };

/** Menangkap error yang dilempar supaya bisa diperiksa field dan pesannya. */
async function errorOf(promise: Promise<unknown>) {
  try {
    await promise;
  } catch (error) {
    return error;
  }
  throw new Error("Seharusnya melempar error");
}

describe("HttpAuthGateway.register", () => {
  it("mengirim POST /auth/register dan memetakan UserDto ke UserProfile", async () => {
    const { fetchMock, gateway } = setup(async () =>
      jsonResponse(
        { data: { id: "usr_1", name: "Rani Putri", email: "rani@email.com", created_at: "2026-11-21T03:00:00.000Z" } },
        201,
      ),
    );

    const user = await gateway.register(rani);

    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).toBe("https://api.example.test/api/v1/auth/register");
    expect(init?.method).toBe("POST");
    expect(JSON.parse(String(init?.body))).toEqual(rani);
    expect(user).toEqual({ id: "usr_1", name: "Rani Putri", email: "rani@email.com", signInMethod: "email" });
  });

  it("409 EMAIL_ALREADY_REGISTERED menjadi ValidationError di field email", async () => {
    const message = "Email sudah terdaftar. Silakan masuk.";
    const { gateway } = setup(async () =>
      jsonResponse(
        { error: { code: "EMAIL_ALREADY_REGISTERED", message, details: { fieldErrors: { email: [message] } } } },
        409,
      ),
    );

    const error = await errorOf(gateway.register(rani));
    expect(error).toBeInstanceOf(ValidationError);
    expect(error).toMatchObject({ field: "email", message });
  });

  it("400 dari aturan password menjadi ValidationError di field password", async () => {
    const message = "Password harus mengandung huruf dan angka";
    const { gateway } = setup(async () =>
      jsonResponse({ error: { code: "VALIDATION_ERROR", message, details: { fieldErrors: { password: [message] } } } }, 400),
    );

    expect(await errorOf(gateway.register({ ...rani, password: "rahasiasekali" }))).toMatchObject({
      field: "password",
      message,
    });
  });

  it("backend mati menjadi ValidationError di field form", async () => {
    const { gateway } = setup(async () => {
      throw new TypeError("fetch failed");
    });

    const error = await errorOf(gateway.register(rani));
    expect(error).toBeInstanceOf(ValidationError);
    expect(error).toMatchObject({ field: "form" });
  });

  it("error 500 diteruskan apa adanya ke error boundary", async () => {
    const { gateway } = setup(async () =>
      jsonResponse({ error: { code: "INTERNAL_ERROR", message: "Terjadi kesalahan di server" } }, 500),
    );

    const error = await errorOf(gateway.register(rani));
    expect(error).toBeInstanceOf(HttpError);
    expect(error).toMatchObject({ status: 500 });
  });
});

describe("HttpAuthGateway.signInWithPassword", () => {
  const login = { email: "rani@email.com", password: "rahasia123", remember: true };

  it("mengirim POST /auth/login dan menyimpan token selama expires_in kalau Ingat saya dicentang", async () => {
    const { fetchMock, saved, gateway } = setup(async () =>
      jsonResponse({ data: { access_token: "eyJ.token.rani", expires_in: 86_400 } }),
    );

    expect(await gateway.signInWithPassword(login)).toEqual({ status: "signed-in" });

    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).toBe("https://api.example.test/api/v1/auth/login");
    expect(JSON.parse(String(init?.body))).toEqual({ email: "rani@email.com", password: "rahasia123" });
    expect(saved).toMatchObject({ token: "eyJ.token.rani", maxAge: 86_400 });
  });

  it("tanpa Ingat saya, token disimpan sebagai session cookie (tanpa maxAge)", async () => {
    const { saved, gateway } = setup(async () => jsonResponse({ data: { access_token: "eyJ.token.rani", expires_in: 86_400 } }));
    await gateway.signInWithPassword({ ...login, remember: false });
    expect(saved).toMatchObject({ token: "eyJ.token.rani", maxAge: undefined });
  });

  it("401 INVALID_CREDENTIALS menjadi status invalid-credentials dan tidak menyimpan token", async () => {
    const { saved, gateway } = setup(async () =>
      jsonResponse({ error: { code: "INVALID_CREDENTIALS", message: "Email atau password salah." } }, 401),
    );
    expect(await gateway.signInWithPassword(login)).toEqual({ status: "invalid-credentials" });
    expect(saved.token).toBeUndefined();
  });

  it("backend mati menjadi ValidationError di field form", async () => {
    const { gateway } = setup(async () => {
      throw new TypeError("fetch failed");
    });
    expect(await errorOf(gateway.signInWithPassword(login))).toMatchObject({ field: "form" });
  });

  it("signOut menghapus cookie token", async () => {
    const { saved, gateway } = setup(async () => jsonResponse({}));
    await gateway.signOut();
    expect(saved.cleared).toBe(true);
  });
});

describe("HttpAuthGateway.currentUser", () => {
  it("memanggil GET /auth/me dan memetakan UserDto ke UserProfile", async () => {
    const { fetchMock, gateway } = setup(async () =>
      jsonResponse({ data: { id: "usr_1", name: "Rani Putri", email: "rani@email.com", created_at: "2026-11-21T03:00:00.000Z" } }),
    );

    expect(await gateway.currentUser()).toEqual({ id: "usr_1", name: "Rani Putri", email: "rani@email.com", signInMethod: "email" });
    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).toBe("https://api.example.test/api/v1/auth/me");
    expect(init?.method).toBe("GET");
  });
});
