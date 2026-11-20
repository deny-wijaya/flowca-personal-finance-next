"use client";

import { useActionState, useState } from "react";
import { TRANSACTION_CATEGORIES, type TransactionType } from "../../domain/transaction";
import { createTransactionAction, type CreateTransactionState } from "../actions";

const initialState: CreateTransactionState = { status: "idle" };

const inputClass =
  "w-full rounded-lg border border-black/15 bg-transparent px-3 py-2 text-sm outline-none focus:border-neutral-900 dark:border-white/20 dark:focus:border-white";

/** `defaultDate` dikirim dari server dalam format "YYYY-MM-DD". */
export function TransactionForm({ defaultDate }: { defaultDate: string }) {
  const [state, formAction, pending] = useActionState(createTransactionAction, initialState);
  const [type, setType] = useState<TransactionType>("expense");
  const fieldErrors = state.status === "error" ? state.fieldErrors : undefined;
  // React me-reset form setelah action selesai. Saat gagal, isi ulang dengan nilai sebelumnya.
  const values = state.status === "error" ? state.values : undefined;

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Jenis" error={fieldErrors?.type?.[0]}>
          <select
            name="type"
            value={type}
            onChange={(e) => setType(e.target.value as TransactionType)}
            className={inputClass}
          >
            <option value="expense">Pengeluaran</option>
            <option value="income">Pemasukan</option>
          </select>
        </Field>

        <Field label="Kategori" error={fieldErrors?.category?.[0]}>
          <select name="category" key={type} defaultValue={values?.category ?? ""} className={inputClass}>
            <option value="" disabled>
              Pilih kategori
            </option>
            {TRANSACTION_CATEGORIES[type].map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Nominal (Rp)" error={fieldErrors?.amount?.[0]}>
          <input
            name="amount"
            type="number"
            inputMode="numeric"
            min={1}
            step={1}
            placeholder="85000"
            defaultValue={values?.amount}
            className={inputClass}
          />
        </Field>

        <Field label="Tanggal" error={fieldErrors?.occurredAt?.[0]}>
          <input
            name="occurredAt"
            type="date"
            defaultValue={values?.occurredAt ?? defaultDate}
            max={defaultDate}
            className={inputClass}
          />
        </Field>
      </div>

      <Field label="Catatan (opsional)" error={fieldErrors?.note?.[0]}>
        <input
          name="note"
          type="text"
          maxLength={200}
          placeholder="Makan siang tim"
          defaultValue={values?.note}
          className={inputClass}
        />
      </Field>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-white dark:text-neutral-900"
        >
          {pending ? "Menyimpan..." : "Simpan transaksi"}
        </button>
        {state.status !== "idle" && (
          <p
            role="status"
            className={`text-sm ${state.status === "success" ? "text-emerald-600" : "text-rose-600"}`}
          >
            {state.message}
          </p>
        )}
      </div>
    </form>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1">
      <span className="text-sm font-medium">{label}</span>
      {children}
      {error && <span className="block text-xs text-rose-600">{error}</span>}
    </label>
  );
}
