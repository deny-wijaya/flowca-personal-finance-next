import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";
import { container } from "@/di/container";
import { ResetPasswordScreen, type ResetPasswordScreenVM } from "@/modules/auth/presentation/screens/auth-screens";

export const metadata: Metadata = { title: "Reset password" };

export default function ResetPasswordPage({ searchParams }: PageProps<"/reset-password">) {
  return (
    <Suspense>
      <ResetPasswordContent searchParams={searchParams} />
    </Suspense>
  );
}

async function ResetPasswordContent({ searchParams }: Pick<PageProps<"/reset-password">, "searchParams">) {
  await connection();
  const { token } = await searchParams;
  const value = typeof token === "string" ? token : "";
  const status = await container.auth().verifyResetToken(value);
  const vm: ResetPasswordScreenVM = status.status === "valid" ? { status: "valid", token: value, email: status.email } : { status: "expired" };
  return <ResetPasswordScreen prototype={container.isPrototypeMode()} vm={vm} />;
}
