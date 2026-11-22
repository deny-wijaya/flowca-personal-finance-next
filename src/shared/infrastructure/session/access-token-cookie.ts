import "server-only";
import { cookies } from "next/headers";

/** Nama cookie yang menyimpan access token dari backend. */
export const ACCESS_TOKEN_COOKIE = "flowca_token";

/** Tempat menyimpan access token. Dipisah sebagai type supaya test bisa memakai versi palsu. */
export type AccessTokenStore = {
  read(): Promise<string | undefined>;
  /** `maxAgeSeconds` kosong artinya session cookie: hilang saat browser ditutup ("Ingat saya" tidak dicentang). */
  save(token: string, maxAgeSeconds?: number): Promise<void>;
  clear(): Promise<void>;
};

/**
 * Menyimpan access token di cookie httpOnly. Hanya server Next yang membaca dan menulisnya:
 * - `httpOnly`: JavaScript di browser tidak bisa membaca token, jadi script hasil XSS tidak bisa mencurinya.
 * - `sameSite: "lax"`: cookie tidak ikut terkirim saat request dipicu dari situs lain (perlindungan dasar CSRF).
 * - `secure`: hanya dikirim lewat HTTPS. Dimatikan di development karena localhost memakai HTTP.
 *
 * Menurut dokumentasi Next, `save` dan `clear` hanya boleh dipanggil dari Server Action atau Route Handler.
 * `read` boleh dipanggil dari mana saja di server, termasuk Server Component.
 */
export function createAccessTokenCookie(options: { secure: boolean }): AccessTokenStore {
  return {
    async read() {
      return (await cookies()).get(ACCESS_TOKEN_COOKIE)?.value;
    },
    async save(token, maxAgeSeconds) {
      (await cookies()).set(ACCESS_TOKEN_COOKIE, token, {
        httpOnly: true,
        secure: options.secure,
        sameSite: "lax",
        path: "/",
        maxAge: maxAgeSeconds,
      });
    },
    async clear() {
      (await cookies()).delete(ACCESS_TOKEN_COOKIE);
    },
  };
}
