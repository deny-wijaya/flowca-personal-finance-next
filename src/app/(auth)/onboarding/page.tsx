import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";
import { container } from "@/di/container";
import { firstName } from "@/modules/auth/domain/user";
import { OnboardingScreen } from "@/modules/auth/presentation/screens/auth-screens";

export const metadata: Metadata = { title: "Onboarding" };

export default function OnboardingPage() {
  return (
    <Suspense>
      <OnboardingContent />
    </Suspense>
  );
}

async function OnboardingContent() {
  await connection();
  const user = await container.auth().currentUser();
  return <OnboardingScreen defaultName={firstName(user.name) ?? ""} />;
}
