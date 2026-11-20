"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { GoogleLogo } from "@/shared/ui/primitives/google-logo";
import { Icon } from "@/shared/ui/primitives/icon";
import { signOutAction } from "../actions";
import type { UserVM } from "../view-models/user-view-model";

const itemClass = "flex min-h-12 items-center gap-3 rounded-md px-3 text-15 font-semibold text-ink no-underline hover:bg-orange-100 hover:text-ink";

/** Avatar + dropdown profil (Pengaturan, Akun keuangan, Keluar). Tutup dengan Esc atau klik di luar. */
export function ProfileMenu({ user }: { user: UserVM }) {
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    menuRef.current?.querySelector<HTMLElement>("[role=menuitem]")?.focus();
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        aria-label="Menu profil"
        className="fc-press relative flex size-13 flex-none items-center justify-center rounded-xl border-3 border-ink bg-pink p-0 font-display text-20 font-bold text-ink shadow-hard-1"
      >
        <span>{user.initials}</span>
        {user.viaGoogle && (
          <span aria-hidden="true" className="absolute -right-2 -bottom-2 flex size-5.5 items-center justify-center rounded-full border-2 border-ink bg-field">
            <GoogleLogo size={12} />
          </span>
        )}
      </button>

      {open && (
        <>
          <div aria-hidden="true" onClick={() => setOpen(false)} className="fixed inset-0 z-40 bg-ink/25" />
          <div ref={menuRef} id={menuId} role="menu" aria-label="Menu profil" className="absolute top-20 right-4 z-50 w-72.5 overflow-hidden rounded-2xl border-3 border-ink bg-paper shadow-hard-4">
            <div className="flex items-center gap-3 border-b-3 border-ink bg-orange-100 p-4">
              <div aria-hidden="true" className="flex size-13 flex-none items-center justify-center rounded-xl border-3 border-ink bg-pink font-display text-20 font-bold">
                {user.initials}
              </div>
              <div className="flex min-w-0 flex-col gap-0.5">
                <div className="text-16 font-bold">{user.name}</div>
                <div className="truncate text-13 text-ink-600">{user.email}</div>
                {user.viaGoogle && <div className="mt-0.5 self-start rounded-xs border-2 border-ink bg-field px-1.5 py-px text-11 font-bold">Masuk via Google</div>}
              </div>
            </div>
            <div className="flex flex-col p-1.5">
              <Link role="menuitem" href="/settings" className={itemClass} onClick={() => setOpen(false)}>
                <Icon name="user" size={20} />
                <span>Pengaturan akun</span>
              </Link>
              <Link role="menuitem" href="/accounts" className={itemClass} onClick={() => setOpen(false)}>
                <Icon name="card" size={20} />
                <span>Akun keuangan</span>
              </Link>
              <div className="mx-2 my-1.5 h-0 border-t-2 border-dashed border-sand-400" />
              <form action={signOutAction} className="m-0">
                <button type="submit" role="menuitem" className="flex min-h-12 w-full cursor-pointer items-center gap-3 rounded-md border-0 bg-transparent px-3 font-body text-15 font-bold text-danger-strong hover:bg-coral-100">
                  <Icon name="logout" size={20} />
                  <span>Keluar</span>
                </button>
              </form>
            </div>
          </div>
        </>
      )}
    </>
  );
}
