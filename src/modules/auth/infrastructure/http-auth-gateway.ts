import { ValidationError } from "@/shared/domain/errors";
import type { HttpClient } from "@/shared/infrastructure/http/http-client";
import { HttpError } from "@/shared/infrastructure/http/http-error";
import type { AuthGateway } from "../domain/auth-gateway";
import type { UserProfile } from "../domain/user";
import { toFieldMessages, toRegisterBody, toUserProfile, userDtoSchema } from "./user-dto";

/**
 * Gateway auth yang memanggil backend (dipakai saat AUTH_MODE=api).
 * Baru `register` yang punya endpoint. Method lain (login, Google, reset password)
 * diteruskan ke `fallback` (gateway tiruan) sampai endpoint-nya dibuat di Fase 2.
 */
export class HttpAuthGateway implements AuthGateway {
  constructor(
    private readonly http: HttpClient,
    private readonly fallback: AuthGateway,
  ) {}

  async register(input: { name: string; email: string; password: string }): Promise<UserProfile> {
    try {
      const dto = await this.http.request("/auth/register", {
        method: "POST",
        body: toRegisterBody(input),
        schema: userDtoSchema,
      });
      return toUserProfile(dto);
    } catch (error) {
      throw toRegisterError(error);
    }
  }

  currentUser() {
    return this.fallback.currentUser();
  }
  signInWithPassword(input: { email: string; password: string; remember: boolean }) {
    return this.fallback.signInWithPassword(input);
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
  signOut() {
    return this.fallback.signOut();
  }
}

/**
 * Menerjemahkan error HTTP menjadi ValidationError, supaya Server Action bisa menampilkannya
 * di bawah field yang tepat tanpa tahu apa pun soal HTTP.
 * - 400 VALIDATION_ERROR dan 409 EMAIL_ALREADY_REGISTERED: pesan per field dari `details.fieldErrors`.
 * - Backend mati atau timeout: pesan umum di field "form".
 * Error lain (500, INVALID_RESPONSE) diteruskan apa adanya ke error boundary.
 */
function toRegisterError(error: unknown): unknown {
  if (!(error instanceof HttpError)) return error;
  if (error.isNetworkError) {
    return new ValidationError("Server sedang tidak bisa dihubungi. Coba lagi sebentar lagi.", "form");
  }
  if (error.status === 400 || error.status === 409) {
    const [first] = toFieldMessages(error.details);
    return new ValidationError(first?.message ?? error.message, first?.field ?? "form");
  }
  return error;
}
