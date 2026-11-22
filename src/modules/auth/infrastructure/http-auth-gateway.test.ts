import { afterEach, describe, expect, it, vi } from "vitest";
import { ValidationError } from "@/shared/domain/errors";
import { HttpClient } from "@/shared/infrastructure/http/http-client";
import { HttpError } from "@/shared/infrastructure/http/http-error";
import { HttpAuthGateway } from "./http-auth-gateway";
import { MockAuthGateway } from "./mock-auth-gateway";

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}

function setup(fetchImpl: typeof fetch) {
  const fetchMock = vi.fn(fetchImpl);
  vi.stubGlobal("fetch", fetchMock);
  const http = new HttpClient({ baseUrl: "https://api.example.test/api/v1", timeoutMs: 1_000 });
  return { fetchMock, gateway: new HttpAuthGateway(http, new MockAuthGateway({ latencyMs: 0 })) };
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
