export type SignInMethod = "google" | "email";

export type UserProfile = {
  id: string;
  name: string;
  email: string;
  signInMethod: SignInMethod;
};

/** "Rani Putri" -> "Rani"; nama kosong -> undefined */
export function firstName(name: string) {
  return name.trim().split(/\s+/)[0] || undefined;
}
