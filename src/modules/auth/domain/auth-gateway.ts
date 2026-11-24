import type { UserProfile } from "./user";

export type PasswordSignInResult = { status: "signed-in" } | { status: "prototype" } | { status: "invalid-credentials" };
export type GoogleSignInResult = "success" | "cancelled" | "error";
export type GoogleCallbackResult = "newUser" | "returning" | "cancelled" | "error";
export type ResetTokenStatus = { status: "valid"; email: string } | { status: "expired" };

/**
 * Port autentikasi. Implementasi sekarang masih tiruan (mode prototipe);
 * provider asli (backend + Google OAuth) cukup mengimplementasikan interface ini.
 */
export interface AuthGateway {
  currentUser(): Promise<UserProfile>;
  signInWithPassword(input: { email: string; password: string; remember: boolean }): Promise<PasswordSignInResult>;
  signInWithGoogle(): Promise<GoogleSignInResult>;
  completeGoogleCallback(input: { code?: string; state?: string; error?: string }): Promise<GoogleCallbackResult>;
  register(input: { name: string; email: string; password: string }): Promise<UserProfile>;
  /** Mengganti nama user yang sedang login (PATCH /auth/me), dari langkah "Nama tampilan" di onboarding. */
  updateName(name: string): Promise<UserProfile>;
  requestPasswordReset(email: string): Promise<void>;
  verifyResetToken(token: string): Promise<ResetTokenStatus>;
  resetPassword(input: { token: string; password: string }): Promise<void>;
  signOut(): Promise<void>;
}
