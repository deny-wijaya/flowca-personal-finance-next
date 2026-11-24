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
  /**
   * IP browser user, diteruskan ke backend di header X-Forwarded-For. Request ke API dikirim oleh
   * server Next, jadi tanpa header ini backend hanya melihat IP server Next, dan rate limit login
   * (5 gagal per menit per IP) akan mengunci semua user sekaligus.
   */
  getClientIp?: () => Promise<string | undefined>;
};

type QueryValue = string | number | boolean | undefined;

type RequestOptions<TSchema extends z.ZodType> = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  query?: Record<string, QueryValue>;
  body?: unknown;
  /** Schema untuk memvalidasi field `data` di response envelope. */
  schema: TSchema;
};

/** Objek `page` di response endpoint daftar (API-CONTRACT.md bagian 1). */
const pageSchema = z.object({ limit: z.number().int(), next_cursor: z.string().nullable() });

/** Hasil `requestPage`: satu halaman item yang sudah divalidasi, plus cursor halaman berikutnya. */
export type PageResult<TItem> = { items: TItem[]; nextCursor: string | null };

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

  /** Request biasa. Mengembalikan isi `data` yang sudah divalidasi dengan `schema`. */
  async request<TSchema extends z.ZodType>(path: string, options: RequestOptions<TSchema>): Promise<z.infer<TSchema>> {
    const envelope = (await this.send(path, options, z.object({ data: options.schema }))) as { data: z.infer<TSchema> };
    return envelope.data;
  }

  /**
   * Request ke endpoint daftar yang memakai pagination. `schema` memvalidasi SATU item di `data`.
   * Mengembalikan item halaman ini dan `next_cursor` untuk mengambil halaman berikutnya.
   */
  async requestPage<TSchema extends z.ZodType>(
    path: string,
    options: Omit<RequestOptions<TSchema>, "method" | "body">,
  ): Promise<PageResult<z.infer<TSchema>>> {
    const envelope = (await this.send(path, options, z.object({ data: z.array(options.schema), page: pageSchema }))) as {
      data: z.infer<TSchema>[];
      page: z.infer<typeof pageSchema>;
    };
    return { items: envelope.data, nextCursor: envelope.page.next_cursor };
  }

  /**
   * Request yang sukses dibalas 204 tanpa body, misalnya DELETE (API-CONTRACT.md bagian 3).
   * `request` tidak bisa dipakai di sini karena ia mewajibkan body `{ data }`.
   */
  async requestNoContent(path: string, options: Omit<RequestOptions<z.ZodType>, "schema">): Promise<void> {
    // Body 204 dibaca sebagai null oleh `send`, jadi yang divalidasi adalah null.
    await this.send(path, options, z.null());
  }

  /** Mengirim request dan mengembalikan seluruh body response setelah divalidasi dengan `envelopeSchema`. */
  private async send(path: string, { method = "GET", query, body }: Omit<RequestOptions<z.ZodType>, "schema">, envelopeSchema: z.ZodType): Promise<unknown> {
    const url = this.buildUrl(path, query);
    const headers = new Headers({ Accept: "application/json" });
    if (body !== undefined) headers.set("Content-Type", "application/json");

    const token = await this.config.getAccessToken?.();
    if (token) headers.set("Authorization", `Bearer ${token}`);

    const clientIp = await this.config.getClientIp?.();
    if (clientIp) headers.set("X-Forwarded-For", clientIp);

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

    // Kontrak sukses dari backend: { data: ... }, ditambah { page } untuk endpoint daftar.
    const parsed = envelopeSchema.safeParse(json);
    if (!parsed.success) {
      throw new HttpError(
        "Format response API tidak sesuai kontrak",
        response.status,
        "INVALID_RESPONSE",
        parsed.error.issues,
      );
    }
    return parsed.data;
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
