"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { cn } from "@/shared/lib/cn";
import { Button } from "@/shared/ui/primitives/button";
import { Checkbox } from "@/shared/ui/primitives/checkbox";
import { TextDivider } from "@/shared/ui/primitives/divider";
import { Notice } from "@/shared/ui/primitives/notice";
import { PasswordField } from "@/shared/ui/primitives/password-field";
import { TextField } from "@/shared/ui/primitives/text-field";
import { signInWithPasswordAction, type SignInState } from "../actions";
import { AuthCard } from "./auth-parts";
import { GoogleButton } from "./google-button";
import { useGoogleSignIn } from "./use-google-sign-in";

const initialState: SignInState = { status: "idle" };

/** Kartu Masuk: tombol Google, divider, form email. `variant` mengikuti ukuran desain mobile/desktop. */
export function LoginForm({ variant }: { variant: "mobile" | "desktop" }) {
  const [state, formAction, pending] = useActionState(signInWithPasswordAction, initialState);
  const google = useGoogleSignIn();
  // Field dikontrol supaya isian tidak hilang saat React me-reset form setelah action.
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const desktop = variant === "desktop";
  const errors = state.status === "error" ? state.fieldErrors : {};
  const idPrefix = desktop ? "dl" : "login";
  const labelClass = desktop ? "text-14" : undefined;
  const messageClass = desktop ? "text-13" : undefined;

  return (
    <AuthCard size={desktop ? "lg" : "md"}>
      <div className="flex flex-col gap-1">
        <h1 className={cn("m-0 font-display font-bold", desktop ? "text-32" : "text-26")}>Masuk</h1>
        <p className={cn("m-0 text-ink-600", desktop ? "text-15" : "text-14")}>Senang lihat kamu lagi! Lanjut catat arus uangmu.</p>
      </div>

      <GoogleButton status={google.status} onClick={google.start} size={desktop ? 54 : 52} />
      {google.status === "success" && (
        <Notice tone="success" size={desktop ? "md" : "sm"} className="flex items-center justify-between gap-2">
          <span>Akun Google terverifikasi (tiruan).</span>
          <Link href={desktop ? "/dashboard" : "/auth/callback?code=new&state=mock"} className="font-bold whitespace-nowrap">
            {desktop ? "Ke beranda →" : "Lanjut →"}
          </Link>
        </Notice>
      )}
      {google.status === "error" && <Notice tone="error">Google tidak merespons. Periksa koneksimu lalu coba lagi.</Notice>}
      {google.message && <Notice tone="info">{google.message}</Notice>}

      <TextDivider className={desktop ? "text-13" : undefined}>atau pakai email</TextDivider>

      <form action={formAction} noValidate className={cn("m-0 flex flex-col", desktop ? "gap-3.5" : "gap-3")}>
        <TextField
          id={`${idPrefix}-email`}
          name="email"
          type="email"
          label="Email"
          autoComplete="email"
          inputMode="email"
          placeholder="nama@email.com"
          size={desktop ? 50 : 48}
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          error={errors.email}
          labelClassName={labelClass}
          messageClassName={messageClass}
        />
        <PasswordField
          id={`${idPrefix}-pw`}
          name="password"
          label="Password"
          autoComplete="current-password"
          placeholder="Minimal 8 karakter"
          size={desktop ? 50 : 48}
          toggleStyle={desktop ? "text" : "icon"}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          error={errors.password}
          labelClassName={labelClass}
          messageClassName={messageClass}
        />
        <div className="flex min-h-11 items-center justify-between gap-2">
          <Checkbox name="remember" label="Ingat saya" defaultChecked />
          <Link href="/forgot-password" className="py-3 text-14 font-bold">
            Lupa password?
          </Link>
        </div>
        <Button type="submit" tone="coral" size={desktop ? 56 : 54} font={desktop ? "display-lg" : "display"} block disabled={pending} className="tracking-[0.02em]">
          {pending ? "Memeriksa…" : "Masuk"}
        </Button>
        {state.status === "prototype" && (
          <Notice tone="note" size={desktop ? "lg" : "sm"} className={cn(!desktop && "flex flex-col gap-1")}>
            <span>Prototipe: login email belum terhubung ke server{desktop ? ". " : ", jadi tidak ada sesi asli yang dibuat."}</span>
            <Link href="/dashboard" className="font-bold">
              {desktop ? "Lihat beranda contoh →" : "Lihat dashboard contoh →"}
            </Link>
          </Notice>
        )}
      </form>
    </AuthCard>
  );
}
