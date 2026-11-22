import { z } from "zod";
import { HttpError } from "./http-error";

export type HttpClientConfig = {
  baseUrl: string;
  timeoutMs: number;
  /** Disiapkan untuk auth: nanti diisi fungsi yang membaca token dari cookie. */
  getAccessToken?: () => Promise<string | undefined>;
  /**
   * Dipanggil saat backend membalas 401 UNAUTHORIZED (token tidak ada, palsu, atau kedaluwarsa).
   * Container mengisinya dengan redirect ke /auth/expired, yang menghapus cookie lalu membuka Login.
   * 401 INVALID_CREDENTIALS (password salah saat login) tidak memicu ini.
   */
  onUnauthorized?: () => never;
};

type QueryValue = string | number | boolean | undefined;

type RequestOptions<TSchema extends z.ZodType> = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  query?: Record<string, QueryValue>;
  body?: unknown;
  /** Schema untuk memvalidasi field `data` di response envelope. */
  schema: TSchema;
};

/** Bentuk error standar dari backend: { error: { code, message, details } } */
const apiErrorSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.unknown().optional(),
  }),
});

/**
 * Wrapper `fetch` untuk semua request ke backend API.
 * Tugasnya: menyusun URL, memasang header & token, timeout,
 * memvalidasi response dengan zod, dan mengubah kegagalan menjadi `HttpError`.
 */
export class HttpClient {
  constructor(private readonly config: HttpClientConfig) {}

  async request<TSchema extends z.ZodType>(
    path: string,
    { method = "GET", query, body, schema }: RequestOptions<TSchema>,
  ): Promise<z.infer<TSchema>> {
    const url = this.buildUrl(path, query);
    const headers = new Headers({ Accept: "application/json" });
    if (body !== undefined) headers.set("Content-Type", "application/json");

    const token = await this.config.getAccessToken?.();
    if (token) headers.set("Authorization", `Bearer ${token}`);

    let response: Response;
    try {
      response = await fetch(url, {
        method,
        headers,
        body: body === undefined ? undefined : JSON.stringify(body),
        signal: AbortSignal.timeout(this.config.timeoutMs),
        // Data keuangan bersifat per-user dan harus selalu fresh.
        cache: "no-store",
      });
    } catch (cause) {
      const isTimeout = cause instanceof DOMException && cause.name === "TimeoutError";
      throw new HttpError(
        isTimeout ? "Server terlalu lama merespons" : "Tidak bisa terhubung ke server",
        0,
        isTimeout ? "TIMEOUT" : "NETWORK_ERROR",
      );
    }

    const json: unknown = response.status === 204 ? null : await response.json().catch(() => null);

    if (!response.ok) {
      const parsedError = apiErrorSchema.safeParse(json);
      if (parsedError.success) {
        const { code, message, details } = parsedError.data.error;
        if (response.status === 401 && code === "UNAUTHORIZED") this.config.onUnauthorized?.();
        throw new HttpError(message, response.status, code, details);
      }
      throw new HttpError(`Request gagal (${response.status})`, response.status);
    }

    // Kontrak sukses dari backend: { data: ... }
    const envelope = z.object({ data: z.unknown() }).safeParse(json);
    const parsed = envelope.success ? schema.safeParse(envelope.data.data) : envelope;
    if (!parsed.success) {
      throw new HttpError(
        "Format response API tidak sesuai kontrak",
        response.status,
        "INVALID_RESPONSE",
        parsed.error.issues,
      );
    }
    return parsed.data as z.infer<TSchema>;
  }

  private buildUrl(path: string, query?: Record<string, QueryValue>) {
    const base = this.config.baseUrl.endsWith("/") ? this.config.baseUrl : `${this.config.baseUrl}/`;
    const url = new URL(path.replace(/^\//, ""), base);
    for (const [key, value] of Object.entries(query ?? {})) {
      if (value !== undefined) url.searchParams.set(key, String(value));
    }
    return url;
  }
}
