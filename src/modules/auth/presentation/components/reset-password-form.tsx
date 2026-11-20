"use client";

import { cva } from "class-variance-authority";
import { useActionState, useState } from "react";
import { cn } from "@/shared/lib/cn";
import { Button, ButtonLink } from "@/shared/ui/primitives/button";
import { fieldLabelClass, fieldVariants } from "@/shared/ui/primitives/field.variants";
import { TextField } from "@/shared/ui/primitives/text-field";
import { resetPasswordAction, type ResetState } from "../actions";
import { toPasswordChecklist } from "../view-models/password-view-model";
import { AuthFormCard } from "./auth-parts";
import { LockArt } from "./illustrations";

const initialState: ResetState = { status: "idle" };
const ruleBox = cva("inline-block size-3.5 flex-none border-2 border-ink", { variants: { ok: { true: "bg-cyan", false: "bg-field" } } });

/** Form password baru + checklist syarat, lalu state "Password diperbarui". */
export function ResetPasswordForm({ token, email }: { token: string; email: string }) {
  const [state, formAction] = useActionState(resetPasswordAction, initialState);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const done = state.status === "done";
  const error = state.status === "error" ? state.fieldErrors.confirm : undefined;

  return (
    <>
      <div className="flex justify-center pt-2">
        <LockArt tone={done ? "cyan" : "orange"} />
      </div>
      {done ? (
        <>
          <div role="status" className="flex flex-col gap-2 text-center">
            <h1 className="m-0 font-display text-28 font-bold">Password diperbarui</h1>
            <p className="m-0 text-15 leading-[1.45] text-ink-600">Semua sesi lama sudah dikeluarkan. Masuk lagi dengan password barumu.</p>
          </div>
          <ButtonLink href="/login" tone="coral" block>
            Masuk sekarang
          </ButtonLink>
        </>
      ) : (
        <>
          <div className="flex flex-col gap-1.5 text-center">
            <h1 className="m-0 font-display text-28 font-bold">Buat password baru</h1>
            <p className="m-0 text-15 text-ink-600">
              Untuk akun <strong className="text-ink">{email}</strong>
            </p>
          </div>
          <AuthFormCard action={formAction} noValidate>
            <input type="hidden" name="token" value={token} />
            <div className="flex flex-col gap-1.5">
              <label htmlFor="rp-pw" className={fieldLabelClass}>
                Password baru
              </label>
              <input
                id="rp-pw"
                name="password"
                type="password"
                autoComplete="new-password"
                placeholder="Minimal 8 karakter"
                aria-describedby="rp-rules"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className={fieldVariants({ className: "px-3.5" })}
              />
              <ul id="rp-rules" className="m-0 mt-1 flex list-none flex-col gap-1 p-0">
                {toPasswordChecklist(password).map((rule) => (
                  <li key={rule.id} className={cn("flex items-center gap-2 text-13", rule.ok ? "text-ink" : "text-ink-600")}>
                    <span aria-hidden="true" className={ruleBox({ ok: rule.ok })} />
                    <span>{rule.label}</span>
                    <span className="fc-sr-only">{rule.ok ? "(terpenuhi)" : "(belum)"}</span>
                  </li>
                ))}
              </ul>
            </div>
            <TextField
              id="rp-pw2"
              name="confirm"
              type="password"
              label="Ulangi password baru"
              autoComplete="new-password"
              placeholder="Ketik ulang"
              value={confirm}
              onChange={(event) => setConfirm(event.target.value)}
              error={error}
            />
            <Button type="submit" tone="pink" block>
              Simpan password
            </Button>
          </AuthFormCard>
        </>
      )}
    </>
  );
}
