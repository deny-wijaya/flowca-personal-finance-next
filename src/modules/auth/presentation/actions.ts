"use server";

import { redirect } from "next/navigation";
import { container } from "@/di/container";
import { ValidationError } from "@/shared/domain/errors";
import type { GoogleSignInResult } from "../domain/auth-gateway";
import { isStrongEnough } from "../domain/password-policy";
import { firstName } from "../domain/user";

/** Semua action auth mengembalikan state kecil yang langsung dipakai form. */
export type FieldErrors = Partial<Record<string, string>>;

export type SignInState = { status: "idle" } | { status: "prototype" } | { status: "error"; fieldErrors: FieldErrors };
export type RegisterState = { status: "idle" } | { status: "success"; firstName: string } | { status: "error"; fieldErrors: FieldErrors };
export type ForgotState = { status: "idle" } | { status: "sent"; email: string } | { status: "error"; fieldErrors: FieldErrors };
export type ResetState = { status: "idle" } | { status: "done" } | { status: "error"; fieldErrors: FieldErrors };

function text(formData: FormData, key: string) {
  return String(formData.get(key) ?? "");
}

function toFieldErrors(error: unknown): FieldErrors {
  if (error instanceof ValidationError) return { [error.field ?? "form"]: error.message };
  throw error;
}

export async function signInWithPasswordAction(_prev: SignInState, formData: FormData): Promise<SignInState> {
  const email = text(formData, "email").trim();
  const password = text(formData, "password");
  const fieldErrors: FieldErrors = {};
  if (!email) fieldErrors.email = "Email wajib diisi.";
  if (!password) fieldErrors.password = "Password wajib diisi.";
  if (Object.keys(fieldErrors).length) return { status: "error", fieldErrors };

  try {
    const result = await container.auth().signInWithPassword({ email, password, remember: formData.get("remember") === "on" });
    if (result.status === "signed-in") redirect("/dashboard");
    if (result.status === "invalid-credentials") return { status: "error", fieldErrors: { password: "Email atau password salah." } };
    return { status: "prototype" };
  } catch (error) {
    const errors = toFieldErrors(error);
    if (errors.email) errors.email = "Format email belum benar, contoh: nama@email.com";
    return { status: "error", fieldErrors: errors };
  }
}

export async function signInWithGoogleAction(): Promise<GoogleSignInResult> {
  return container.auth().signInWithGoogle();
}

export async function registerAction(_prev: RegisterState, formData: FormData): Promise<RegisterState> {
  const name = text(formData, "name");
  const email = text(formData, "email");
  const password = text(formData, "password");
  const confirm = text(formData, "confirm");
  const fieldErrors: FieldErrors = {};
  if (!name.trim()) fieldErrors.name = "Nama lengkap wajib diisi.";
  if (!email.trim()) fieldErrors.email = "Email wajib diisi.";
  if (password.length < 8) fieldErrors.password = "Password minimal 8 karakter.";
  if (!confirm) fieldErrors.confirm = "Ketik ulang password kamu.";
  else if (confirm !== password) fieldErrors.confirm = "Password belum sama.";
  if (formData.get("terms") !== "on") fieldErrors.terms = "Centang dulu persetujuan ini untuk lanjut.";
  if (Object.keys(fieldErrors).length) return { status: "error", fieldErrors };

  try {
    const user = await container.auth().register({ name, email, password });
    // Langsung masuk setelah daftar, supaya tombol "Mulai onboarding" tidak dilempar ke layar Login.
    // Di mode tiruan, hasilnya "prototype" dan tidak ada sesi yang dibuat.
    await container.auth().signInWithPassword({ email, password, remember: true });
    return { status: "success", firstName: firstName(user.name) ?? "teman" };
  } catch (error) {
    return { status: "error", fieldErrors: toFieldErrors(error) };
  }
}

/** Daftar via Google (mode prototipe: langsung sukses atas nama "Rani"). */
export async function registerWithGoogleAction(): Promise<RegisterState> {
  const result = await container.auth().signInWithGoogle();
  return result === "success" ? { status: "success", firstName: "Rani" } : { status: "idle" };
}

export async function requestPasswordResetAction(_prev: ForgotState, formData: FormData): Promise<ForgotState> {
  const email = text(formData, "email").trim();
  if (!email) return { status: "error", fieldErrors: { email: "Email wajib diisi." } };
  try {
    await container.auth().requestPasswordReset(email);
    return { status: "sent", email };
  } catch (error) {
    return { status: "error", fieldErrors: toFieldErrors(error) };
  }
}

export async function resendPasswordResetAction(email: string) {
  await container.auth().requestPasswordReset(email);
}

export async function resetPasswordAction(_prev: ResetState, formData: FormData): Promise<ResetState> {
  const password = text(formData, "password");
  const confirm = text(formData, "confirm");
  // Urutan pesan sama dengan desain: syarat password dulu, baru kecocokan.
  if (!isStrongEnough(password)) return { status: "error", fieldErrors: { confirm: "Password baru belum memenuhi semua syarat di atas." } };
  if (confirm !== password) return { status: "error", fieldErrors: { confirm: "Kedua password belum sama." } };

  try {
    await container.auth().resetPassword({ token: text(formData, "token"), password });
    return { status: "done" };
  } catch (error) {
    const errors = toFieldErrors(error);
    return { status: "error", fieldErrors: { confirm: errors.password ?? errors.form } };
  }
}

export async function signOutAction() {
  await container.auth().signOut();
  redirect("/login");
}
