import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";
import { container } from "@/di/container";
import { AuthCallbackScreen } from "@/modules/auth/presentation/screens/auth-screens";

//Login
export const metadata: Metadata = { title: "Menghubungkan akun" };

export default function AuthCallbackPage({ searchParams }: PageProps<"/auth/callback">) {
  return (
    <Suspense>
      <AuthCallbackContent searchParams={searchParams} />
    </Suspense>
  );
}

async function AuthCallbackContent({ searchParams }: Pick<PageProps<"/auth/callback">, "searchParams">) {
  await connection();
  const params = await searchParams;
  const pick = (key: string) => (typeof params[key] === "string" ? (params[key] as string) : undefined);
  const result = await container.auth().completeGoogleCallback({ code: pick("code"), state: pick("state"), error: pick("error") });
  return <AuthCallbackScreen prototype={container.isPrototypeMode()} result={result} />;
}
