import type { Metadata } from "next";
import { container } from "@/di/container";
import { ForgotPasswordScreen } from "@/modules/auth/presentation/screens/auth-screens";

export const metadata: Metadata = { title: "Lupa password" };

export default function ForgotPasswordPage() {
  return <ForgotPasswordScreen prototype={container.isPrototypeMode()} />;
}
