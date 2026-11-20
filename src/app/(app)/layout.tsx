import { connection } from "next/server";
import { Suspense } from "react";
import { container } from "@/di/container";
import { ProfileCard } from "@/modules/auth/presentation/components/profile-card";
import { toUserVM } from "@/modules/auth/presentation/view-models/user-view-model";
import { QuickAddPanel } from "@/modules/quick-add/presentation/components/quick-add-panel";
import { quickAddGreeting } from "@/modules/quick-add/presentation/greetings";
import { AppShell } from "@/shared/ui/layout/app-shell";

/** Layout halaman terproteksi: AppShell dengan kartu profil di sidebar dan panel Catat cepat. */
export default function AppLayout({ children }: LayoutProps<"/">) {
  return (
    <AppShell
      sidebarFooter={
        <Suspense>
          <SidebarProfile />
        </Suspense>
      }
      rightPanel={
        <Suspense>
          <QuickAddSidePanel />
        </Suspense>
      }
    >
      {children}
    </AppShell>
  );
}

async function currentUser() {
  await connection();
  return toUserVM(await container.auth().currentUser());
}

async function SidebarProfile() {
  return <ProfileCard user={await currentUser()} />;
}

async function QuickAddSidePanel() {
  const user = await currentUser();
  const subtitle = container.isPrototypeMode() ? "Koko · simulasi, belum terhubung ke AI" : "Koko · asisten pencatat";
  return <QuickAddPanel greeting={quickAddGreeting(user.firstName, "panel")} subtitle={subtitle} />;
}
