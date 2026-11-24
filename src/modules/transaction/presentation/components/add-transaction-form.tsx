"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef, useState, useTransition } from "react";
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
import { createTransactionAction, deleteTransactionAction, updateTransactionAction, type CreateTransactionState } from "../actions";
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

/** Isi awal form saat mengubah transaksi yang sudah ada (/transactions/edit?id=...). */
export type TransactionFormInitial = {
  type: "out" | "in";
  /** "1.500.000" */
  amount: string;
  categoryId: string;
  /** "" untuk transaksi lama yang belum punya akun. */
  accountId: string;
  /** "2026-11-24" */
  date: string;
  /** "09:30" */
  time: string;
  note: string;
};

type AddTransactionFormProps = {
  /** Diisi saat mengubah transaksi: form terisi data lama, dan muncul tombol Hapus transaksi. */
  edit?: { id: string; initial: TransactionFormInitial };
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
export function AddTransactionForm({ edit, accounts, categories: initialCategories, defaultDate, defaultTime, closeHref }: AddTransactionFormProps) {
  const initial = edit?.initial;
  // Saat mengubah, id transaksi diikat ke Server Action supaya form tetap mengirim FormData biasa.
  const [state, formAction, pending] = useActionState(edit ? updateTransactionAction.bind(null, edit.id) : createTransactionAction, initialState);
  const [type, setType] = useState<FormType>(initial?.type ?? "out");
  const [amount, setAmount] = useState(initial?.amount ?? "");
  /** Id kategori yang dipilih. */
  const [categoryId, setCategoryId] = useState(initial?.categoryId ?? "");
  /** Kategori dari server, ditambah kategori yang baru dibuat lewat chip "+ Kategori baru". */
  const [categoryOptions, setCategoryOptions] = useState(initialCategories);
  const [accountId, setAccountId] = useState(initial ? initial.accountId : (accounts[0]?.id ?? ""));
  const [toAccountId, setToAccountId] = useState(accounts[1]?.id ?? "");
  const [date, setDate] = useState(initial?.date ?? defaultDate);
  const [time, setTime] = useState(initial?.time ?? defaultTime);
  const [note, setNote] = useState(initial?.note ?? "");
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
          {edit ? "Ubah transaksi" : "Tambah transaksi"}
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
          <div role="radiogroup" aria-label="Jenis transaksi" className={cn("grid gap-0.75 rounded-xl border-3 border-ink bg-paper p-0.75", edit ? "grid-cols-2" : "grid-cols-3")}>
            {/* Transaksi yang sudah ada tidak bisa diubah menjadi transfer. */}
            {TYPES.filter((item) => !edit || item.id !== "tf").map((item) => (
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
          {edit && <DeleteTransaction id={edit.id} />}
        </div>

        <div className="border-t-3 border-ink bg-paper px-5 pt-3 pb-5">
          <Button type="submit" tone="orange" size={56} block loading={pending}>
            {pending ? "Menyimpan…" : edit ? "Simpan perubahan" : "Simpan transaksi"}
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
      {accounts.length === 0 && (
        <Notice>
          Kamu belum punya akun. Tambahkan dulu di menu{" "}
          <Link href="/accounts" className="font-bold text-ink">
            Akun
          </Link>
          , lalu catat transaksinya.
        </Notice>
      )}
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

/**
 * Tombol "Hapus transaksi" di sheet ubah. Ketukan pertama hanya membuka konfirmasi di tempat yang sama,
 * supaya transaksi tidak terhapus karena salah ketuk (PRD A3). "Ya, hapus" memanggil Server Action, yang
 * kembali ke menu Transaksi kalau berhasil.
 */
function DeleteTransaction({ id }: { id: string }) {
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string>();
  const [deleting, startDeleting] = useTransition();
  const boxRef = useRef<HTMLDivElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);

  // Di HP, kotak konfirmasi muncul di dekat bawah sheet dan bisa tertutup tombol "Simpan perubahan" yang
  // menempel di bawah. Kotaknya digulir ke area terlihat, dan fokus dipindah ke Batal (pilihan yang aman).
  useEffect(() => {
    if (!confirming) return;
    boxRef.current?.scrollIntoView({ block: "center", behavior: "smooth" });
    cancelRef.current?.focus({ preventScroll: true });
  }, [confirming]);

  if (!confirming) {
    return (
      <Button tone="paper" size={46} font="body-xs" className="self-start text-danger" onClick={() => setConfirming(true)}>
        Hapus transaksi
      </Button>
    );
  }

  return (
    <div ref={boxRef} role="alertdialog" aria-labelledby="delete-trx-title" className="flex flex-col gap-2.5 rounded-xl border-3 border-ink bg-coral-50 p-3.5">
      <div id="delete-trx-title" className="text-15 font-bold">
        Hapus transaksi ini? Saldo akun dan ringkasan bulan ini ikut berubah.
      </div>
      {error && <div className="text-14 font-semibold text-danger">{error}</div>}
      <div className="flex gap-2">
        <Button
          tone="coral"
          size={44}
          font="body-xs"
          loading={deleting}
          onClick={() =>
            startDeleting(async () => {
              // Kalau berhasil, action langsung redirect. Yang kembali ke sini hanya error.
              const result = await deleteTransactionAction(id);
              setError(result.message);
            })
          }
        >
          Ya, hapus
        </Button>
        <Button ref={cancelRef} tone="paper" size={44} font="body-xs" disabled={deleting} onClick={() => setConfirming(false)}>
          Batal
        </Button>
      </div>
    </div>
  );
}
