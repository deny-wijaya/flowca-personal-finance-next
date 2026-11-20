import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";
import { container } from "@/di/container";
import { firstName } from "@/modules/auth/domain/user";
import { OpenPanelOnDesktop } from "@/modules/quick-add/presentation/components/open-panel-on-desktop";
import { quickAddGreeting } from "@/modules/quick-add/presentation/greetings";
import { QuickAddScreen } from "@/modules/quick-add/presentation/screens/quick-add-screen";

export const metadata: Metadata = { title: "Catat cepat" };

export default function QuickAddPage() {
  return (
    <Suspense>
      <QuickAddContent />
    </Suspense>
  );
}

async function QuickAddContent() {
  await connection();
  const user = await container.auth().currentUser();
  return (
    <>
      <OpenPanelOnDesktop />
      <QuickAddScreen prototype={container.isPrototypeMode()} greeting={quickAddGreeting(firstName(user.name) ?? user.name, "page")} />
    </>
  );
}
