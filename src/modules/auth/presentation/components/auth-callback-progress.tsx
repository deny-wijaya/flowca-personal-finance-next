"use client";

import { cva } from "class-variance-authority";
import Link from "next/link";
import { useEffect, useState } from "react";
import { cn } from "@/shared/lib/cn";
import { ButtonLink } from "@/shared/ui/primitives/button";
import { Card } from "@/shared/ui/primitives/card";
import { Koko } from "@/shared/ui/primitives/koko";
import type { GoogleCallbackResult } from "../../domain/auth-gateway";

const STEPS = ["Menerima respons dari Google", "Memverifikasi akun di server", "Menyiapkan sesi Flowca"] as const;
const STEP_MS = 900;

const COPY: Record<GoogleCallbackResult, { title: string; body: string; action: string; href: string; tone: "cyan" | "coral" | "orange" }> = {
  newUser: { title: "Selamat datang di Flowca!", body: "Akun Google-mu terhubung. Yuk siapkan dompet digitalmu.", action: "Mulai onboarding", href: "/onboarding", tone: "cyan" },
  returning: { title: "Selamat datang kembali!", body: "Sesi tersimpan, kamu tetap masuk walau halaman di-refresh.", action: "Buka dashboard", href: "/dashboard", tone: "cyan" },
  cancelled: { title: "Masuk dibatalkan", body: "Kamu menutup jendela Google sebelum selesai. Tidak ada yang berubah.", action: "Kembali ke login", href: "/login", tone: "coral" },
  error: { title: "Ups, ada kendala", body: "Google tidak bisa memverifikasi akunmu barusan. Coba lagi sebentar.", action: "Coba lagi", href: "/login", tone: "orange" },
};

const stepBox = cva("flex size-6 flex-none items-center justify-center border-3 border-ink font-display text-14", {
  variants: { state: { done: "bg-cyan", active: "bg-orange-100", failed: "bg-coral", pending: "bg-field" } },
});

type StepState = "done" | "active" | "failed" | "pending";
const MARK: Record<StepState, string> = { done: "✓", active: "…", failed: "×", pending: "" };

/** Checklist 3 langkah callback OAuth, lalu salah satu dari 4 hasil. Hasil sudah diketahui server; animasi hanya umpan balik. */
export function AuthCallbackProgress({ result }: { result: GoogleCallbackResult }) {
  const [tick, setTick] = useState(0);
  const failed = result === "cancelled" || result === "error";
  const failAt = result === "cancelled" ? 0 : 1;
  const finished = failed ? tick > failAt : tick >= STEPS.length;

  useEffect(() => {
    if (finished) return;
    const timer = setTimeout(() => setTick((value) => value + 1), STEP_MS);
    return () => clearTimeout(timer);
  }, [tick, finished]);

  const stepState = (index: number): StepState => {
    if (failed && tick > index && index === failAt) return "failed";
    if (tick > index && !(failed && index >= failAt)) return "done";
    if (tick === index && !(failed && index > failAt)) return "active";
    return "pending";
  };
  const copy = COPY[result];

  return (
    <>
      <div className="flex justify-center pt-6">
        <Koko size={112} animate={finished ? "none" : "hop"} />
      </div>
      <div role="status" aria-live="polite" className="flex flex-col gap-1.5 text-center">
        <h1 className="m-0 font-display text-26 font-bold">{finished ? copy.title : "Menghubungkan akun Google…"}</h1>
        <p className="m-0 text-15 leading-[1.45] text-ink-600">{finished ? copy.body : "Sebentar ya, jangan tutup halaman ini."}</p>
      </div>
      <Card as="ol" className="m-0 flex list-none flex-col gap-3 p-4">
        {STEPS.map((label, index) => {
          const state = stepState(index);
          return (
            <li key={label} className={cn("flex items-center gap-3 text-14 font-semibold", state === "pending" ? "text-ink-500" : "text-ink")}>
              <span aria-hidden="true" className={stepBox({ state })}>
                {MARK[state]}
              </span>
              <span>{label}</span>
            </li>
          );
        })}
      </Card>
      {finished && (
        <div className="mt-auto flex flex-col gap-3">
          <ButtonLink href={copy.href} tone={copy.tone} block>
            {copy.action}
          </ButtonLink>
          {failed && (
            <Link href="/login" className="py-2.5 text-center text-15 font-bold">
              Masuk pakai email saja
            </Link>
          )}
        </div>
      )}
    </>
  );
}
