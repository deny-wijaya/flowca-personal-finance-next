import { ValidationError } from "@/shared/domain/errors";
import type { AuthGateway } from "../domain/auth-gateway";
import { isStrongEnough, isValidEmail, MIN_PASSWORD_LENGTH } from "../domain/password-policy";

/**
 * Use case autentikasi. Validasi bentuk input dilakukan di form/Server Action,
 * aturan bisnis (format email, kekuatan password) dicek ulang di sini.
 */
export class AuthUseCases {
  constructor(private readonly gateway: AuthGateway) {}

  currentUser() {
    return this.gateway.currentUser();
  }

  signInWithPassword(input: { email: string; password: string; remember: boolean }) {
    if (!isValidEmail(input.email)) throw new ValidationError("Format email belum benar.", "email");
    if (!input.password) throw new ValidationError("Password wajib diisi.", "password");
    return this.gateway.signInWithPassword({ ...input, email: input.email.trim() });
  }

  signInWithGoogle() {
    return this.gateway.signInWithGoogle();
  }

  completeGoogleCallback(input: { code?: string; state?: string; error?: string }) {
    return this.gateway.completeGoogleCallback(input);
  }

  register(input: { name: string; email: string; password: string }) {
    if (!input.name.trim()) throw new ValidationError("Nama lengkap wajib diisi.", "name");
    if (!isValidEmail(input.email)) throw new ValidationError("Format email belum benar.", "email");
    if (input.password.length < MIN_PASSWORD_LENGTH) throw new ValidationError("Password minimal 8 karakter.", "password");
    return this.gateway.register({ ...input, name: input.name.trim(), email: input.email.trim() });
  }

  requestPasswordReset(email: string) {
    if (!isValidEmail(email)) throw new ValidationError("Format email belum benar.", "email");
    return this.gateway.requestPasswordReset(email.trim());
  }

  verifyResetToken(token: string) {
    return this.gateway.verifyResetToken(token);
  }

  resetPassword(input: { token: string; password: string }) {
    if (!isStrongEnough(input.password)) throw new ValidationError("Password baru belum memenuhi semua syarat di atas.", "password");
    return this.gateway.resetPassword(input);
  }

  signOut() {
    return this.gateway.signOut();
  }
}
