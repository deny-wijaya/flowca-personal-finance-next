import { checkPasswordRules, passwordStrength, type PasswordRuleId } from "../../domain/password-policy";

const STRENGTH_LABEL = ["Minimal 8 karakter, campur huruf & angka.", "Masih lemah", "Lumayan", "Kuat", "Kuat sekali"] as const;
const STRENGTH_TONE = ["coral", "orange", "cyan", "cyan"] as const;

export type StrengthTone = (typeof STRENGTH_TONE)[number];

/** Meter kekuatan 4 bar di form Daftar. */
export function toStrengthMeter(password: string) {
  const score = passwordStrength(password);
  return {
    filled: score,
    tone: score > 0 ? STRENGTH_TONE[score - 1] : undefined,
    hint: password ? `Kekuatan: ${STRENGTH_LABEL[score]}` : STRENGTH_LABEL[0],
  };
}

const RULE_LABEL: Record<PasswordRuleId, string> = {
  length: "Minimal 8 karakter",
  mixed: "Campuran huruf dan angka",
  noBrand: "Tidak mengandung kata “flowca”",
};

/** Checklist syarat password di layar Reset password. */
export function toPasswordChecklist(password: string) {
  const rules = checkPasswordRules(password);
  return (Object.keys(RULE_LABEL) as PasswordRuleId[]).map((id) => ({ id, label: RULE_LABEL[id], ok: rules[id] }));
}
