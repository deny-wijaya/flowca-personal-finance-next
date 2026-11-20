import Link from "next/link";
import { Icon } from "@/shared/ui/primitives/icon";
import type { UserVM } from "../view-models/user-view-model";

/** Kartu profil di bawah Sidebar desktop. */
export function ProfileCard({ user }: { user: UserVM }) {
  return (
    <Link href="/settings" className="flex items-center gap-2.5 rounded-xl border-3 border-ink bg-paper p-2.5 text-ink no-underline hover:bg-orange-100 hover:text-ink">
      <span aria-hidden="true" className="flex size-10 flex-none items-center justify-center rounded-lg border-2 border-ink bg-pink font-display text-16 font-bold">
        {user.initials}
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-px">
        <span className="text-14 font-bold">{user.name}</span>
        <span className="truncate text-12 text-ink-600">{user.email}</span>
      </span>
      <Icon name="chevron-right" size={16} />
    </Link>
  );
}
