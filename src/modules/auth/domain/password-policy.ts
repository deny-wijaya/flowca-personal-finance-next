/**
 * Aturan password Flowca. Dipakai di server (validasi akhir) dan di form
 * (checklist & meter kekuatan), supaya keduanya tidak pernah berbeda.
 */
export const MIN_PASSWORD_LENGTH = 8;

export type PasswordRuleId = "length" | "mixed" | "noBrand";

export function checkPasswordRules(password: string): Record<PasswordRuleId, boolean> {
  return {
    length: password.length >= MIN_PASSWORD_LENGTH,
    mixed: /[A-Za-z]/.test(password) && /\d/.test(password),
    noBrand: password.length > 0 && !password.toLowerCase().includes("flowca"),
  };
}

export function isStrongEnough(password: string) {
  return Object.values(checkPasswordRules(password)).every(Boolean);
}

/** Skor 0–4: panjang ≥ 8, huruf besar+kecil, ada angka, simbol atau panjang ≥ 12. */
export function passwordStrength(password: string): 0 | 1 | 2 | 3 | 4 {
  let score = 0;
  if (password.length >= MIN_PASSWORD_LENGTH) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password) || password.length >= 12) score++;
  return score as 0 | 1 | 2 | 3 | 4;
}

const EMAIL_PATTERN = /^\S+@\S+\.\S+$/;

export function isValidEmail(email: string) {
  return EMAIL_PATTERN.test(email.trim());
}
