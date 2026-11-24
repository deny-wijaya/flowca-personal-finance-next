import { ValidationError } from "@/shared/domain/errors";
import type { HttpClient } from "@/shared/infrastructure/http/http-client";
import { HttpError } from "@/shared/infrastructure/http/http-error";
import type { AccessTokenStore } from "@/shared/infrastructure/session/access-token-cookie";
import type { AuthGateway, PasswordSignInResult } from "../domain/auth-gateway";
import type { UserProfile } from "../domain/user";
import { accessTokenDtoSchema, toFieldMessages, toRegisterBody, toUserProfile, userDtoSchema } from "./user-dto";

/**
 * Gateway auth yang memanggil backend (dipakai saat AUTH_MODE=api).
 * Register, login dengan email, profil user, dan keluar sudah memakai backend. Method lain (Google,
 * reset password) diteruskan ke `fallback` (gateway tiruan) sampai endpoint-nya dibuat.
 */
export class HttpAuthGateway implements AuthGateway {
  constructor(
    private readonly http: HttpClient,
    private readonly fallback: AuthGateway,
    private readonly tokens: AccessTokenStore,
  ) {}

  /**
   * Login dengan email. Token dari backend disimpan di cookie httpOnly.
   * "Ingat saya" dicentang: cookie berlaku selama `expires_in` (1 hari).
   * Tidak dicentang: session cookie yang hilang saat browser ditutup.
   */
  async signInWithPassword(input: { email: string; password: string; remember: boolean }): Promise<PasswordSignInResult> {
    try {
      const dto = await this.http.request("/auth/login", {
        method: "POST",
        body: { email: input.email, password: input.password },
        schema: accessTokenDtoSchema,
      });
      await this.tokens.save(dto.access_token, input.remember ? dto.expires_in : undefined);
      return { status: "signed-in" };
    } catch (error) {
      if (error instanceof HttpError && error.code === "INVALID_CREDENTIALS") return { status: "invalid-credentials" };
      throw toFormError(error);
    }
  }

  async signOut() {
    await this.tokens.clear();
  }

  async register(input: { name: string; email: string; password: string }): Promise<UserProfile> {
    try {
      const dto = await this.http.request("/auth/register", {
        method: "POST",
        body: toRegisterBody(input),
        schema: userDtoSchema,
      });
      return toUserProfile(dto);
    } catch (error) {
      throw toFormError(error);
    }
  }

  /** PATCH /auth/me. Nama kosong atau terlalu panjang (400) menjadi ValidationError di field name. */
  async updateName(name: string): Promise<UserProfile> {
    try {
      const dto = await this.http.request("/auth/me", { method: "PATCH", body: { name }, schema: userDtoSchema });
      return toUserProfile(dto);
    } catch (error) {
      throw toFormError(error);
    }
  }

  /** Profil user pemilik token di cookie (`GET /auth/me`). Dipakai kartu profil dan sapaan Catat cepat. */
  async currentUser(): Promise<UserProfile> {
    const dto = await this.http.request("/auth/me", { schema: userDtoSchema });
    return toUserProfile(dto);
  }
  signInWithGoogle() {
    return this.fallback.signInWithGoogle();
  }
  completeGoogleCallback(input: { code?: string; state?: string; error?: string }) {
    return this.fallback.completeGoogleCallback(input);
  }
  requestPasswordReset(email: string) {
    return this.fallback.requestPasswordReset(email);
  }
  verifyResetToken(token: string) {
    return this.fallback.verifyResetToken(token);
  }
  resetPassword(input: { token: string; password: string }) {
    return this.fallback.resetPassword(input);
  }
}

/**
 * Menerjemahkan error HTTP menjadi ValidationError, supaya Server Action bisa menampilkannya
 * di bawah field yang tepat tanpa tahu apa pun soal HTTP.
 * Dipakai oleh register dan login.
 * - 400 VALIDATION_ERROR dan 409 EMAIL_ALREADY_REGISTERED: pesan per field dari `details.fieldErrors`.
 * - Backend mati atau timeout: pesan umum di field "form".
 * - 429 TOO_MANY_REQUESTS (terlalu banyak login gagal): pesan dari backend di field "form".
 * Error lain (500, INVALID_RESPONSE) diteruskan apa adanya ke error boundary.
 */
function toFormError(error: unknown): unknown {
  if (!(error instanceof HttpError)) return error;
  if (error.isNetworkError) {
    return new ValidationError("Server sedang tidak bisa dihubungi. Coba lagi sebentar lagi.", "form");
  }
  if (error.status === 429) return new ValidationError(error.message, "form");
  if (error.status === 400 || error.status === 409) {
    const [first] = toFieldMessages(error.details);
    return new ValidationError(first?.message ?? error.message, first?.field ?? "form");
  }
  return error;
}
