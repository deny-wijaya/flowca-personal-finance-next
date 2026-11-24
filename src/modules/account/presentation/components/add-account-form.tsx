"use client";

import { useActionState, useState } from "react";
import { cn } from "@/shared/lib/cn";
import { Button } from "@/shared/ui/primitives/button";
import { Card } from "@/shared/ui/primitives/card";
import { Checkbox } from "@/shared/ui/primitives/checkbox";
import { Chip } from "@/shared/ui/primitives/chip";
import { fieldLabelClass, fieldMessageClass } from "@/shared/ui/primitives/field.variants";
import { MoneyInput } from "@/shared/ui/primitives/money-input";
import { Notice } from "@/shared/ui/primitives/notice";
import { TextField } from "@/shared/ui/primitives/text-field";
import type { AccountKind } from "../../domain/account";
import { createAccountAction, type CreateAccountState } from "../actions";
import { ACCOUNT_KIND_OPTIONS } from "../view-models/account-view-model";

const initialState: CreateAccountState = { status: "idle" };

/**
 * Form "Tambah akun" di menu Akun. Setelah tersimpan, daftar akun di atasnya ikut diperbarui
 * (Server Action memanggil revalidatePath), dan form dikosongkan untuk akun berikutnya.
 */
export function AddAccountForm() {
  const [state, formAction, pending] = useActionState(createAccountAction, initialState);
  // Semua field dikontrol state. React 19 mengosongkan input yang tidak dikontrol setiap kali
  // <form action> selesai, termasuk saat hasilnya error, sehingga nama yang sudah diketik akan hilang.
  const [name, setName] = useState("");
  const [kind, setKind] = useState<AccountKind>("bank");
  const [balance, setBalance] = useState("");
  const [isDebt, setIsDebt] = useState(false);
  // Form dikosongkan setiap kali satu akun berhasil disimpan.
  const [resetFor, setResetFor] = useState<number>();
  const errors = state.status === "error" ? state.fieldErrors : undefined;

  if (state.status === "success" && state.savedAt !== resetFor) {
    setResetFor(state.savedAt);
    setName("");
    setBalance("");
    setIsDebt(false);
  }

  return (
    <Card as="section" aria-labelledby="add-account-title" elevation={2} className="flex flex-col gap-4 p-4.5">
      <h2 id="add-account-title" className="m-0 font-display text-20 font-bold">
        Tambah akun
      </h2>
      <form action={formAction} noValidate className="m-0 flex flex-col gap-4">
        <input type="hidden" name="kind" value={kind} />
        <TextField
          id="account-name"
          name="name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          label="Nama akun"
          placeholder="Misal: BCA, GoPay, Dompet"
          maxLength={40}
          size={46}
          error={errors?.name?.[0]}
        />

        <fieldset className="m-0 flex flex-col gap-2 border-0 p-0">
          <legend className={cn(fieldLabelClass, "mb-2 p-0")}>Jenis</legend>
          <div role="radiogroup" aria-label="Jenis akun" className="flex flex-wrap gap-2">
            {ACCOUNT_KIND_OPTIONS.map((option) => (
              <Chip key={option.id} behavior="radio" selected={kind === option.id} onClick={() => setKind(option.id)} className="min-h-11 px-4">
                {option.label}
              </Chip>
            ))}
          </div>
          {errors?.kind && <div className={cn(fieldMessageClass, "text-danger")}>{errors.kind[0]}</div>}
        </fieldset>

        <MoneyInput
          id="account-balance"
          name="openingBalance"
          label={isDebt ? "Utang saat ini" : "Saldo saat ini"}
          tone={isDebt ? "coral" : "cyan"}
          prefix={isDebt ? "−Rp" : "Rp"}
          value={balance}
          onValueChange={setBalance}
          hint="Saldo saat akun mulai dicatat. Transaksi berikutnya akan menambah atau menguranginya."
          error={errors?.openingBalance?.[0]}
        />
        <label className="flex items-center gap-2.5 text-14 font-semibold">
          <Checkbox name="isDebt" boxSize={18} checked={isDebt} onChange={(event) => setIsDebt(event.target.checked)} />
          Saldonya minus (misalnya tagihan kartu kredit)
        </label>

        {state.status === "error" && !errors && <Notice tone="error">{state.message}</Notice>}
        {state.status === "success" && <Notice tone="success">Akun {state.name} tersimpan.</Notice>}

        <Button type="submit" tone="orange" size={50} block loading={pending}>
          {pending ? "Menyimpan…" : "Simpan akun"}
        </Button>
      </form>
    </Card>
  );
}
