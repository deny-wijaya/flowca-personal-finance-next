"use client";

import { useActionState, useState } from "react";
import { cn } from "@/shared/lib/cn";
import { MINUS, parseThousands, formatThousands } from "@/shared/lib/format";
import { Button, ButtonLink } from "@/shared/ui/primitives/button";
import { CategoryTile } from "@/shared/ui/primitives/category-tile";
import { Chip } from "@/shared/ui/primitives/chip";
import { fieldLabelClass, fieldMessageClass, fieldVariants } from "@/shared/ui/primitives/field.variants";
import { IconLink } from "@/shared/ui/primitives/icon-button";
import { Icon } from "@/shared/ui/primitives/icon";
import { Koko } from "@/shared/ui/primitives/koko";
import { MoneyInput } from "@/shared/ui/primitives/money-input";
import { Notice } from "@/shared/ui/primitives/notice";
import { createTransactionAction, type CreateTransactionState } from "../actions";
import type { FormType } from "../transaction-form-schema";
import { categoryInitial, categoryTone } from "../view-models/category-tone";
import { formatSavedSummary, type CategoryOptionVM } from "../view-models/transaction-view-model";
import { AddCategoryChip } from "./add-category-chip";
import { Amount } from "./amount";

const TYPES: { id: FormType; label: string; tone: "coral" | "cyan" | "pink"; sign: string }[] = [
  { id: "out", label: "Pengeluaran", tone: "coral", sign: MINUS },
  { id: "in", label: "Pemasukan", tone: "cyan", sign: "+" },
  { id: "tf", label: "Transfer", tone: "pink", sign: "" },
];

type Account = { id: string; name: string };

type AddTransactionFormProps = {
  accounts: Account[];
  /** Kategori bawaan dan kustom dari GET /categories (kedua jenis). */
  categories: CategoryOptionVM[];
  defaultDate: string;
  defaultTime: string;
  /** Tujuan tombol tutup & "Kembali ke beranda". */
  closeHref: string;
};

const initialState: CreateTransactionState = { status: "idle" };

/** Isi sheet "Tambah transaksi": form → status "Tersimpan!". */
export function AddTransactionForm({ accounts, categories: initialCategories, defaultDate, defaultTime, closeHref }: AddTransactionFormProps) {
  const [state, formAction, pending] = useActionState(createTransactionAction, initialState);
  const [type, setType] = useState<FormType>("out");
  const [amount, setAmount] = useState("");
  /** Id kategori yang dipilih. */
  const [categoryId, setCategoryId] = useState("");
  /** Kategori dari server, ditambah kategori yang baru dibuat lewat chip "+ Kategori baru". */
  const [categoryOptions, setCategoryOptions] = useState(initialCategories);
  const [accountId, setAccountId] = useState(accounts[0]?.id ?? "");
  const [toAccountId, setToAccountId] = useState(accounts[1]?.id ?? "");
  const [date, setDate] = useState(defaultDate);
  const [time, setTime] = useState(defaultTime);
  const [note, setNote] = useState("");
  const [dismissedAt, setDismissedAt] = useState<number>();

  const current = TYPES.find((item) => item.id === type)!;
  const errors = state.status === "error" ? state.fieldErrors : undefined;
  const done = state.status === "success" && state.savedAt !== dismissedAt;
  const nameOf = (id: string) => accounts.find((account) => account.id === id)?.name ?? "";
  const categoryType = type === "in" ? "income" : "expense";
  const categories = categoryOptions.filter((option) => option.type === categoryType);
  const categoryName = categoryOptions.find((option) => option.id === categoryId)?.name;

  function reset() {
    if (state.status === "success") setDismissedAt(state.savedAt);
    setType("out");
    setAmount("");
    setCategoryId("");
    setNote("");
  }

  if (done) {
    return (
      <div role="status" className="flex flex-1 flex-col items-center gap-4 px-5 pt-7 pb-6 text-center">
        <Koko size={96} />
        <h1 id="add-title" className="m-0 font-display text-28 font-bold">
          Tersimpan!
        </h1>
        <div className="flex w-full flex-col gap-1.5 rounded-2xl border-3 border-ink bg-paper p-4 shadow-hard-2">
          <Amount size={28} value={`${current.sign}Rp ${formatThousands(parseThousands(amount))}`} direction={type === "out" ? "out" : type === "in" ? "in" : "neutral"} />
          <div className="text-14 text-ink-600">
            {formatSavedSummary({ category: categoryName, account: nameOf(accountId), toAccount: nameOf(toAccountId), date, time, note, transfer: type === "tf" })}
          </div>
        </div>
        <div className="text-14 text-ink-600">Saldo dan anggaran sudah ikut diperbarui.</div>
        <div className="mt-auto flex w-full flex-col gap-3">
          <ButtonLink href={closeHref} tone="cyan" block>
            Kembali ke beranda
          </ButtonLink>
          <Button tone="paper" size={50} font="body" block onClick={reset}>
            Tambah lagi
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between px-5 pt-2 pb-2.5">
        <h1 id="add-title" className="m-0 font-display text-24 font-bold">
          Tambah transaksi
        </h1>
        <IconLink href={closeHref} aria-label="Tutup">
          <Icon name="x" size={18} strokeWidth={3.2} />
        </IconLink>
      </div>

      <form action={formAction} noValidate className="m-0 flex min-h-0 flex-1 flex-col">
        <input type="hidden" name="type" value={type} />
        <input type="hidden" name="categoryId" value={categoryId} />
        <input type="hidden" name="accountId" value={accountId} />
        {type === "tf" && <input type="hidden" name="toAccountId" value={toAccountId} />}

        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-5 pt-1 pb-4">
          <div role="radiogroup" aria-label="Jenis transaksi" className="grid grid-cols-3 gap-0.75 rounded-xl border-3 border-ink bg-paper p-0.75">
            {TYPES.map((item) => (
              <Chip
                key={item.id}
                behavior="radio"
                shape="segment"
                activeTone={item.tone}
                selected={type === item.id}
                onClick={() => {
                  setType(item.id);
                  setCategoryId("");
                }}
              >
                {item.label}
              </Chip>
            ))}
          </div>

          <MoneyInput
            id="add-amt"
            name="amount"
            label="Jumlah"
            size="lg"
            tone={current.tone}
            prefix={`${current.sign}Rp`}
            value={amount}
            onValueChange={setAmount}
            error={errors?.amount?.[0]}
          />

          {type !== "tf" && (
            <fieldset className="m-0 flex flex-col gap-2 border-0 p-0">
              <legend className={cn(fieldLabelClass, "mb-2 p-0")}>Kategori</legend>
              <div className="grid grid-cols-4 gap-2">
                {categories.map((option) => (
                  <Chip key={option.id} shape="tile" selected={categoryId === option.id} onClick={() => setCategoryId(option.id)}>
                    <CategoryTile initial={categoryInitial(option.name)} tone={categoryTone(option.name)} size={30} />
                    <span className="text-11 font-bold">{option.name}</span>
                  </Chip>
                ))}
                <AddCategoryChip
                  // key: kotak isian ditutup saat jenis transaksi diganti.
                  key={categoryType}
                  type={categoryType}
                  onCreated={(created) => {
                    setCategoryOptions((current) => [...current, created]);
                    setCategoryId(created.id);
                  }}
                />
              </div>
              {errors?.categoryId && (
                <div role="alert" className={cn(fieldMessageClass, "text-danger")}>
                  {errors.categoryId[0]}
                </div>
              )}
            </fieldset>
          )}

          <AccountPicker legend={type === "tf" ? "Dari akun" : "Akun"} accounts={accounts} value={accountId} onChange={setAccountId} />
          {type === "tf" && (
            <AccountPicker legend="Ke akun" accounts={accounts} value={toAccountId} onChange={setToAccountId} error={errors?.toAccountId?.[0]} />
          )}

          <div className="grid grid-cols-2 gap-2.5">
            <DateTimeField id="add-date" name="date" type="date" label="Tanggal" value={date} onChange={setDate} error={errors?.date?.[0]} />
            <DateTimeField id="add-time" name="time" type="time" label="Jam" value={time} onChange={setTime} error={errors?.time?.[0]} />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="add-note" className={fieldLabelClass}>
              Catatan <span className="font-medium text-ink-600">(opsional)</span>
            </label>
            <input
              id="add-note"
              name="note"
              type="text"
              maxLength={200}
              placeholder="Misal: makan siang bareng tim"
              value={note}
              onChange={(event) => setNote(event.target.value)}
              className={fieldVariants({ size: 46, className: "px-3.5" })}
            />
          </div>

          {state.status === "error" && !errors && <Notice tone="error">{state.message}</Notice>}
        </div>

        <div className="border-t-3 border-ink bg-paper px-5 pt-3 pb-5">
          <Button type="submit" tone="orange" size={56} block loading={pending}>
            {pending ? "Menyimpan…" : "Simpan transaksi"}
          </Button>
        </div>
      </form>
    </>
  );
}

function AccountPicker({ legend, accounts, value, onChange, error }: { legend: string; accounts: Account[]; value: string; onChange: (id: string) => void; error?: string }) {
  return (
    <fieldset className="m-0 flex flex-col gap-2 border-0 p-0">
      <legend className={cn(fieldLabelClass, "mb-2 p-0")}>{legend}</legend>
      <div className="flex flex-wrap gap-2">
        {accounts.map((account) => (
          <Chip key={account.id} selected={value === account.id} onClick={() => onChange(account.id)} className="min-h-11 px-4">
            {account.name}
          </Chip>
        ))}
      </div>
      {error && (
        <div role="alert" className={cn(fieldMessageClass, "text-danger")}>
          {error}
        </div>
      )}
    </fieldset>
  );
}

function DateTimeField({ id, name, type, label, value, onChange, error }: { id: string; name: string; type: "date" | "time"; label: string; value: string; onChange: (value: string) => void; error?: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className={fieldLabelClass}>
        {label}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={error ? true : undefined}
        className={fieldVariants({ size: 46, invalid: Boolean(error), className: "px-2.5 text-15" })}
      />
      {error && <div className={cn(fieldMessageClass, "text-danger")}>{error}</div>}
    </div>
  );
}
