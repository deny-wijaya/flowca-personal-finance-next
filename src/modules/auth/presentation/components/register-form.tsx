"use client";

import Link from "next/link";
import { useActionState, useState, useTransition } from "react";
import { cva } from "class-variance-authority";
import { cn } from "@/shared/lib/cn";
import { Button, ButtonLink } from "@/shared/ui/primitives/button";
import { Dialog } from "@/shared/ui/primitives/dialog";
import { TextDivider } from "@/shared/ui/primitives/divider";
import { fieldMessageClass } from "@/shared/ui/primitives/field.variants";
import { Koko } from "@/shared/ui/primitives/koko";
import { TextField } from "@/shared/ui/primitives/text-field";
import { registerAction, registerWithGoogleAction, type RegisterState } from "../actions";
import { toStrengthMeter, type StrengthTone } from "../view-models/password-view-model";
import { AuthCard } from "./auth-parts";
import { GoogleButton } from "./google-button";

const initialState: RegisterState = { status: "idle" };

const strengthBar = cva("h-2 border-2 border-ink", {
  variants: { tone: { coral: "bg-coral", orange: "bg-orange", cyan: "bg-cyan", empty: "bg-field" } },
});

/** Form Daftar + dialog "Akun siap". */
export function RegisterForm() {
  const [state, formAction, pending] = useActionState(registerAction, initialState);
  const [googleState, setGoogleState] = useState<RegisterState>(initialState);
  const [googlePending, startGoogle] = useTransition();
  const [values, setValues] = useState({ name: "", email: "", password: "", confirm: "" });
  const [terms, setTerms] = useState(false);

  const errors = state.status === "error" ? state.fieldErrors : {};
  const meter = toStrengthMeter(values.password);
  const success = googleState.status === "success" ? googleState : state.status === "success" ? state : undefined;
  const bind = (key: keyof typeof values) => ({ name: key, value: values[key], onChange: (event: React.ChangeEvent<HTMLInputElement>) => setValues((v) => ({ ...v, [key]: event.target.value })) });

  return (
    <>
      <AuthCard className="gap-3 p-4.5">
        <GoogleButton
          status={googlePending ? "loading" : "idle"}
          idleLabel="Daftar dengan Google"
          onClick={() => startGoogle(async () => setGoogleState(await registerWithGoogleAction()))}
        />
        <TextDivider>atau daftar pakai email</TextDivider>

        <form action={formAction} noValidate className="m-0 flex flex-col gap-2.5">
          <TextField id="reg-name" label="Nama lengkap" autoComplete="name" placeholder="Nama kamu" size={46} className="gap-1.25" error={errors.name} {...bind("name")} />
          <TextField id="reg-email" label="Email" type="email" autoComplete="email" inputMode="email" placeholder="nama@email.com" size={46} className="gap-1.25" error={errors.email} {...bind("email")} />
          <div className="flex flex-col gap-1.25">
            <TextField id="reg-pw" label="Password" type="password" autoComplete="new-password" placeholder="Minimal 8 karakter" size={46} className="gap-1.25" {...bind("password")} aria-describedby="reg-pw-hint" aria-invalid={errors.password ? true : undefined} />
            <div aria-hidden="true" className="grid grid-cols-4 gap-1">
              {[0, 1, 2, 3].map((index) => (
                <span key={index} className={strengthBar({ tone: index < meter.filled && meter.tone ? (meter.tone as StrengthTone) : "empty" })} />
              ))}
            </div>
            <div id="reg-pw-hint" className={cn(fieldMessageClass, errors.password ? "text-danger" : "text-ink-600")}>
              {errors.password ?? meter.hint}
            </div>
          </div>
          <TextField id="reg-pw2" label="Konfirmasi password" type="password" autoComplete="new-password" placeholder="Ketik ulang password" size={46} className="gap-1.25" error={errors.confirm} {...bind("confirm")} />

          <label className="flex cursor-pointer items-start gap-2.5 py-1 text-13 leading-[1.4]">
            <input type="checkbox" name="terms" checked={terms} onChange={(event) => setTerms(event.target.checked)} aria-invalid={errors.terms ? true : undefined} className="m-0 size-5 flex-none accent-ink" />
            <span>
              Saya setuju dengan{" "}
              <Link href="/terms" className="font-bold">
                Syarat Layanan
              </Link>{" "}
              dan{" "}
              <Link href="/privacy" className="font-bold">
                Kebijakan Privasi
              </Link>{" "}
              Flowca.
            </span>
          </label>
          {errors.terms && <div className={cn(fieldMessageClass, "-mt-1.5 text-danger")}>{errors.terms}</div>}

          <Button type="submit" tone="orange" size={54} block disabled={pending} className="mt-0.5">
            {pending ? "Membuat akun…" : "Buat akun"}
          </Button>
        </form>
      </AuthCard>

      {success?.status === "success" && (
        <Dialog side="center" labelledBy="reg-ok-title" onClose={() => undefined} className="open:flex open:flex-col open:items-center open:gap-3 open:p-6 open:text-center">
          <Koko size={96} />
          <h2 id="reg-ok-title" className="m-0 font-display text-24 font-bold">
            Akun siap, {success.firstName}!
          </h2>
          <p className="m-0 text-14 text-ink-600">Yuk atur beberapa hal kecil dulu. Bisa dilewati kok.</p>
          <ButtonLink href="/onboarding" tone="cyan" size={52} font="body" block>
            Mulai onboarding
          </ButtonLink>
        </Dialog>
      )}
    </>
  );
}
