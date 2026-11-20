import { initials } from "@/shared/lib/format";
import { firstName, type UserProfile } from "../../domain/user";

export type UserVM = {
  name: string;
  firstName: string;
  initials: string;
  email: string;
  viaGoogle: boolean;
};

export function toUserVM(user: UserProfile): UserVM {
  return { name: user.name, firstName: firstName(user.name) ?? user.name, initials: initials(user.name), email: user.email, viaGoogle: user.signInMethod === "google" };
}
