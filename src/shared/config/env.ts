import "server-only";
import { z } from "zod";

/**
 * Satu-satunya tempat yang membaca `process.env`.
 * Env divalidasi saat server start, jadi salah konfigurasi langsung ketahuan
 * (bukan baru error ketika request pertama ke API).
 */
const envSchema = z
  .object({
    DATA_SOURCE: z.enum(["mock", "api"]).default("mock"),
    API_BASE_URL: z.url().optional(),
    API_TIMEOUT_MS: z.coerce.number().int().positive().default(10_000),
  })
  .superRefine((env, ctx) => {
    if (env.DATA_SOURCE === "api" && !env.API_BASE_URL) {
      ctx.addIssue({
        code: "custom",
        path: ["API_BASE_URL"],
        message: "API_BASE_URL wajib diisi jika DATA_SOURCE=api",
      });
    }
  });

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Env tidak valid:", z.flattenError(parsed.error).fieldErrors);
  throw new Error("Konfigurasi env tidak valid. Cek .env.local (lihat .env.example).");
}

export const env = parsed.data;
