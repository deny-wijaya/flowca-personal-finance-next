import { z } from "zod";
import type { UserProfile } from "../domain/user";

/**
 * Bentuk data auth sesuai kontrak backend (`express-personal-finance/docs/API-CONTRACT.md` bagian 4.1 dan 4.2).
 * Kalau backend mengubah format, cukup ubah file ini. Domain dan UI tidak ikut berubah.
 */
export const userDtoSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  created_at: z.iso.datetime({ offset: true }),
});

export type UserDto = z.infer<typeof userDtoSchema>;

/** User yang baru daftar lewat form selalu masuk dengan metode email. */
export function toUserProfile(dto: UserDto): UserProfile {
  return { id: dto.id, name: dto.name, email: dto.email, signInMethod: "email" };
}

/**
 * Body request `POST /auth/register`. `confirm` hanya dicek di frontend. Centang persetujuan dikirim sebagai
 * `terms_accepted: true`; registerAction sudah menolak form yang belum dicentang sebelum sampai ke sini.
 */
export function toRegisterBody(input: { name: string; email: string; password: string }) {
  return { name: input.name, email: input.email, password: input.password, terms_accepted: true };
}

/** Response `POST /auth/login`. */
export const accessTokenDtoSchema = z.object({
  access_token: z.string().min(1),
  expires_in: z.number().int().positive(),
});

/** `details` dari error 400/409 backend: `{ fieldErrors: { email: ["..."] } }`. */
const fieldErrorsDetailsSchema = z.object({
  fieldErrors: z.record(z.string(), z.array(z.string()).optional()),
});

/** Mengambil pesan error pertama per field dari `details`. Hasilnya `[]` kalau bentuknya tidak dikenal. */
export function toFieldMessages(details: unknown): Array<{ field: string; message: string }> {
  const parsed = fieldErrorsDetailsSchema.safeParse(details);
  if (!parsed.success) return [];
  return Object.entries(parsed.data.fieldErrors).flatMap(([field, messages]) =>
    messages?.[0] ? [{ field, message: messages[0] }] : [],
  );
}
