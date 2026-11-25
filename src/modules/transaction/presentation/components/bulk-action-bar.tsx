"use client";

import { useState, useTransition } from "react";
import { cn } from "@/shared/lib/cn";
import { bulkEditTransactionsAction } from "../actions";
import { categoryOptionLabel, type CategoryOptionVM, type Direction } from "../view-models/transaction-view-model";

type Mode = "idle" | "delete" | "category" | "account";

type BulkActionBarProps = {
  /** Transaksi yang dicentang: id dan jenisnya ("in" pemasukan, "out" pengeluaran). */
  selected: { id: string; direction: Direction }[];
  categories: CategoryOptionVM[];
  accounts: { id: string; name: string }[];
  /** Dipanggil setelah aksi berhasil, untuk mengosongkan centang. */
  onDone: () => void;
  onCancel: () => void;
};

/**
 * Bar aksi di tabel Transaksi desktop, muncul setelah user mencentang transaksi (API-CONTRACT.md bagian 4.11).
 * Setiap aksi membuka langkah konfirmasi di bar yang sama: Hapus meminta "Ya, hapus", sedangkan Ubah kategori
 * dan Pindah akun meminta pilihan tujuan dulu. Backend memproses semuanya sekaligus: berhasil semua atau tidak sama sekali.
 */
export function BulkActionBar({ selected, categories, accounts, onDone, onCancel }: BulkActionBarProps) {
  const [mode, setMode] = useState<Mode>("idle");
  const [target, setTarget] = useState("");
  const [error, setError] = useState<string>();
  const [pending, startTransition] = useTransition();

  const count = selected.length;
  const directions = new Set(selected.map((row) => row.direction));
  // Kategori harus cocok dengan jenis setiap transaksi, jadi hanya bisa diubah kalau jenisnya seragam.
  const sameType = directions.size === 1;
  const categoryType = directions.has("in") ? "income" : "expense";
  const categoryChoices = categories.filter((category) => category.type === categoryType);

  function open(next: Mode) {
    setMode(next);
    setError(undefined);
    setTarget(next === "category" ? (categoryChoices[0]?.id ?? "") : next === "account" ? (accounts[0]?.id ?? "") : "");
  }

  function run() {
    const ids = selected.map((row) => row.id);
    const action =
      mode === "delete"
        ? ({ kind: "delete" } as const)
        : ({ kind: "update", categoryId: mode === "category" ? target : undefined, accountId: mode === "account" ? target : undefined } as const);
    startTransition(async () => {
      const result = await bulkEditTransactionsAction(ids, action);
      if (result.status === "error") {
        setError(result.message);
        return;
      }
      setMode("idle");
      onDone();
    });
  }

  return (
    <div role="region" aria-label="Aksi untuk transaksi terpilih" className="flex flex-col gap-2 rounded-xl bg-ink px-3.5 py-2.5 text-cream">
      <div className="flex flex-wrap items-center gap-3">
        <span className="flex-1 text-14 font-bold">{count} transaksi dipilih</span>

        {mode === "idle" && (
          <>
            <BarButton
              onClick={() => open("category")}
              disabled={!sameType}
              title={sameType ? undefined : "Pilih transaksi dengan jenis yang sama (semua pengeluaran atau semua pemasukan)"}
            >
              Ubah kategori
            </BarButton>
            <BarButton onClick={() => open("account")} disabled={accounts.length === 0}>
              Pindah akun
            </BarButton>
            <BarButton tone="danger" onClick={() => open("delete")}>
              Hapus
            </BarButton>
            <button type="button" onClick={onCancel} className="h-10 cursor-pointer border-0 bg-transparent px-2.5 font-body text-14 font-semibold text-cream underline">
              Batal
            </button>
          </>
        )}

        {mode === "delete" && (
          <>
            <span className="text-14 font-semibold">Hapus {count} transaksi ini? Saldo dan ringkasan ikut berubah.</span>
            <BarButton tone="danger" loading={pending} onClick={run}>
              Ya, hapus
            </BarButton>
            <BarButton onClick={() => setMode("idle")} disabled={pending}>
              Kembali
            </BarButton>
          </>
        )}

        {(mode === "category" || mode === "account") && (
          <>
            <label className="flex items-center gap-2 text-14 font-semibold">
              {mode === "category" ? "Kategori baru" : "Pindah ke akun"}
              <select
                value={target}
                onChange={(event) => setTarget(event.target.value)}
                className="h-10 rounded-md border-2 border-cream bg-ink px-2 font-body text-14 text-cream"
              >
                {(mode === "category" ? categoryChoices.map((c) => ({ id: c.id, label: categoryOptionLabel(c) })) : accounts.map((a) => ({ id: a.id, label: a.name }))).map(
                  (option) => (
                    <option key={option.id} value={option.id}>
                      {option.label}
                    </option>
                  ),
                )}
              </select>
            </label>
            <BarButton tone="accent" loading={pending} disabled={!target} onClick={run}>
              Terapkan
            </BarButton>
            <BarButton onClick={() => setMode("idle")} disabled={pending}>
              Kembali
            </BarButton>
          </>
        )}
      </div>
      {!sameType && mode === "idle" && (
        <div className="text-12 text-cream/80">Ubah kategori hanya bisa untuk transaksi berjenis sama. Yang dipilih campuran pemasukan dan pengeluaran.</div>
      )}
      {error && (
        <div role="alert" className="rounded-md bg-coral-50 px-2.5 py-1.5 text-13 font-semibold text-danger-strong">
          {error}
        </div>
      )}
    </div>
  );
}

function BarButton({
  children,
  onClick,
  disabled,
  loading,
  tone = "outline",
  title,
}: {
  children: string;
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  tone?: "outline" | "danger" | "accent";
  title?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      title={title}
      className={cn(
        "h-10 cursor-pointer rounded-md border-2 px-3.5 font-body text-14 font-bold disabled:cursor-not-allowed disabled:opacity-50",
        tone === "outline" && "border-cream bg-transparent text-cream",
        tone === "danger" && "border-ink bg-coral text-ink",
        tone === "accent" && "border-ink bg-cyan text-ink",
      )}
    >
      {loading ? "Memproses…" : children}
    </button>
  );
}
