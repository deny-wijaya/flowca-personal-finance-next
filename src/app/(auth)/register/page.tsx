import type { Metadata } from "next";
import { container } from "@/di/container";
import { RegisterScreen } from "@/modules/auth/presentation/screens/auth-screens";

export const metadata: Metadata = { title: "Daftar" };

export default function RegisterPage() {
  return <RegisterScreen prototype={container.isPrototypeMode()} />;
}
