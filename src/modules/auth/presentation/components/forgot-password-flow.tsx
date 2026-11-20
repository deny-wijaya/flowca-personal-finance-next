"use client";

import Link from "next/link";
import { useActionState, useEffect, useState } from "react";
import { Button, ButtonLink } from "@/shared/ui/primitives/button";
import { Card } from "@/shared/ui/primitives/card";
import { TextField } from "@/shared/ui/primitives/text-field";
import { requestPasswordResetAction, resendPasswordResetAction, type ForgotState } from "../actions";
import { AuthFormCard } from "./auth-parts";

const COOLDOWN_SECONDS = 30;
const initialState: ForgotState = { status: "idle" };

/** Dua state: form email → "Cek inbox kamu" dengan cooldown kirim ulang 30 detik. */
export function ForgotPasswordFlow() {
  const [email, setEmail] = useState("");
  const [editing, setEditing] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [state, formAction, pending] = useActionState(async (prev: ForgotState, formData: FormData) => {
    const next = await requestPasswordResetAction(prev, formData);
    if (next.status === "sent") {
      setEditing(false);
      setCooldown(COOLDOWN_SECONDS);
    }
    return next;
  }, initialState);
  const sent = state.status === "sent" && !editing;

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((value) => value - 1), 1_000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  if (sent) {
    return (
      <>
        <div role="status" className="flex flex-col gap-2 text-center">
          <h1 className="m-0 font-display text-28 font-bold">Cek inbox kamu</h1>
          <p className="m-0 text-15 leading-[1.45] text-ink-600">
            Kalau <strong className="text-ink">{state.email}</strong> terdaftar, link reset sudah kami kirim. Link berlaku 30 menit.
          </p>
        </div>
        <Card className="flex flex-col gap-3 p-4.5">
          <div className="text-14 leading-[1.45] text-ink-600">Tidak ada di inbox? Cek folder spam atau promosi, atau kirim ulang.</div>
          <Button
            tone="white"
            size={50}
            font="body-sm"
            block
            disabled={cooldown > 0}
            onClick={async () => {
              setCooldown(COOLDOWN_SECONDS);
              await resendPasswordResetAction(state.email);
            }}
          >
            {cooldown > 0 ? `Kirim ulang dalam ${cooldown} dtk` : "Kirim ulang email"}
          </Button>
          <Link href="/reset-password?token=demo" className="py-2.5 text-center text-13 font-bold">
            Buka contoh link reset (prototipe) →
          </Link>
        </Card>
        <ButtonLink href="/login" tone="coral" block>
          Kembali ke login
        </ButtonLink>
        <button
          type="button"
          onClick={() => {
            setEditing(true);
            setCooldown(0);
          }}
          className="min-h-11 cursor-pointer border-0 bg-transparent font-body text-14 font-semibold text-ink underline"
        >
          Salah email? Ubah
        </button>
      </>
    );
  }

  const error = state.status === "error" ? state.fieldErrors.email : undefined;
  return (
    <>
      <div className="flex flex-col gap-1.5 text-center">
        <h1 className="m-0 font-display text-28 font-bold">Lupa password?</h1>
        <p className="m-0 text-15 leading-[1.45] text-ink-600">Tenang, terjadi ke semua orang. Masukkan email akunmu, kami kirim link untuk bikin password baru.</p>
      </div>
      <AuthFormCard action={formAction} noValidate>
        <TextField
          id="fp-email"
          name="email"
          type="email"
          label="Email terdaftar"
          autoComplete="email"
          inputMode="email"
          placeholder="nama@email.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          error={error}
        />
        <Button type="submit" tone="cyan" block disabled={pending}>
          {pending ? "Mengirim…" : "Kirim link reset"}
        </Button>
      </AuthFormCard>
      <div className="mt-auto text-center text-15">
        Ingat password-nya?{" "}
        <Link href="/login" className="font-bold">
          Kembali ke login
        </Link>
      </div>
    </>
  );
}
