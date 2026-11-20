import type { Metadata } from "next";
import { container } from "@/di/container";
import { LoginScreen } from "@/modules/auth/presentation/screens/auth-screens";

export const metadata: Metadata = { title: "Masuk" };

export default function LoginPage() {
  return <LoginScreen prototype={container.isPrototypeMode()} />;
}
