import type { AuthGateway, GoogleCallbackResult, GoogleSignInResult, ResetTokenStatus } from "../domain/auth-gateway";
import type { UserProfile } from "../domain/user";

const DEMO_USER: UserProfile = { id: "user-rani", name: "Rani Putri", email: "rani.putri@gmail.com", signInMethod: "google" };

type MockAuthOptions = {
  /** Hasil simulasi tombol Google (sama dengan opsi "Simulasi" di file desain). */
  googleOutcome?: GoogleSignInResult;
  /** Jeda tiruan agar state loading terlihat. 0 di unit test. */
  latencyMs?: number;
};

/**
 * Autentikasi tiruan untuk mode prototipe. Tidak ada sesi asli yang dibuat;
 * semua layar auth menampilkan pita "MODE PROTOTIPE" selama gateway ini dipakai.
 */
export class MockAuthGateway implements AuthGateway {
  private readonly googleOutcome: GoogleSignInResult;
  private readonly latencyMs: number;

  constructor(options: MockAuthOptions = {}) {
    this.googleOutcome = options.googleOutcome ?? "success";
    this.latencyMs = options.latencyMs ?? 1_000;
  }

  private wait() {
    return new Promise((resolve) => setTimeout(resolve, this.latencyMs));
  }

  async currentUser() {
    return DEMO_USER;
  }

  async signInWithPassword() {
    await this.wait();
    return { status: "prototype" } as const;
  }

  async signInWithGoogle() {
    await this.wait();
    return this.googleOutcome;
  }

  async completeGoogleCallback({ code, error }: { code?: string; error?: string }): Promise<GoogleCallbackResult> {
    if (error === "access_denied") return "cancelled";
    if (error || !code) return "error";
    return code === "returning" ? "returning" : "newUser";
  }

  async register(input: { name: string; email: string }) {
    await this.wait();
    return { ...DEMO_USER, name: input.name, email: input.email, signInMethod: "email" } as const;
  }

  async requestPasswordReset() {
    await this.wait();
  }

  async verifyResetToken(token: string): Promise<ResetTokenStatus> {
    return token === "expired" ? { status: "expired" } : { status: "valid", email: "rani@email.com" };
  }

  async resetPassword() {
    await this.wait();
  }

  async signOut() {}
}
