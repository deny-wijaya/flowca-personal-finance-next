"use client";

import { useState, useTransition } from "react";
import { cn } from "@/shared/lib/cn";
import { Badge } from "@/shared/ui/primitives/badge";
import { Button } from "@/shared/ui/primitives/button";
import { CategoryTile } from "@/shared/ui/primitives/category-tile";
import { fieldVariants } from "@/shared/ui/primitives/field.variants";
import { Icon } from "@/shared/ui/primitives/icon";
import { MoneyInput } from "@/shared/ui/primitives/money-input";
import { PixelProgress } from "@/shared/ui/primitives/pixel-progress";
import { deleteBudgetAction, setBudgetAction } from "../actions";
import type { BudgetRowVM } from "../view-models/budget-view-model";

/**
 * Kartu anggaran satu kategori di menu Anggaran. Tombol "Ubah" membuka kotak nominal di dalam kartu yang
 * sama (tanpa pindah layar). Simpan mengganti batasnya, Hapus menghapus anggaran kategori itu.
 */
export function BudgetCard({ row }: { row: BudgetRowVM }) {
  const [editing, setEditing] = useState(false);
  const [amount, setAmount] = useState(row.limitInput);
  const [error, setError] = useState<string>();
  const [pending, startTransition] = useTransition();
  const inputId = `budget-${row.categoryId}`;

  function run(action: () => Promise<{ status: "success" } | { status: "error"; message: string }>) {
    startTransition(async () => {
      const result = await action();
      if (result.status === "error") setError(result.message);
      else setEditing(false);
    });
  }

  return (
    <div className="flex flex-col gap-2 rounded-xl border-3 border-ink bg-paper p-3 shadow-hard-2">
      <span className="flex items-center gap-2.5">
        <CategoryTile initial={row.initial} tone={row.tone} size={36} />
        <span className="flex min-w-0 flex-1 flex-col gap-px">
          <span className="text-15 font-bold">{row.category}</span>
          <span className="fc-num text-12 text-ink-600">{row.detail}</span>
        </span>
        <Badge tone={row.status} size="md">
          {row.badge}
        </Badge>
      </span>
      <PixelProgress segments={10} filled={row.filled10} tone={row.status} />
      <span className="flex items-center justify-between gap-2">
        <span className={cn("text-12 font-semibold", row.noteTone === "danger" ? "text-danger" : "text-ink-600")}>{row.note}</span>
        {!editing && (
          <button
            type="button"
            onClick={() => {
              setAmount(row.limitInput);
              setError(undefined);
              setEditing(true);
            }}
            aria-label={`Ubah anggaran ${row.category}`}
            className="flex h-9 cursor-pointer items-center gap-1 rounded-md border-2 border-ink bg-paper px-2.5 font-body text-13 font-bold text-ink hover:bg-orange-50"
          >
            <Icon name="pencil" size={14} />
            Ubah
          </button>
        )}
      </span>

      {editing && (
        <div className="flex flex-col gap-2.5 border-t-2 border-dashed border-sand-200 pt-2.5">
          <MoneyInput id={inputId} label={`Batas ${row.category} per bulan`} tone="pink" value={amount} onValueChange={setAmount} error={error} autoFocus />
          <div className="flex gap-2">
            <Button tone="cyan" size={44} font="body-xs" loading={pending} onClick={() => run(() => setBudgetAction(row.categoryId, amount))}>
              Simpan
            </Button>
            <Button tone="paper" size={44} font="body-xs" disabled={pending} onClick={() => setEditing(false)}>
              Batal
            </Button>
            <Button tone="coral" size={44} font="body-xs" disabled={pending} className="ml-auto" onClick={() => run(() => deleteBudgetAction(row.categoryId))}>
              Hapus
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

/** "Tambah anggaran kategori": pilih kategori pengeluaran yang belum dianggarkan, lalu isi batasnya. */
export function AddBudget({ categories }: { categories: { id: string; name: string }[] }) {
  const [open, setOpen] = useState(false);
  const [categoryId, setCategoryId] = useState("");
  const [amount, setAmount] = useState("");
  const [error, setError] = useState<string>();
  const [pending, startTransition] = useTransition();

  if (categories.length === 0) return null;

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => {
          setOpen(true);
          setCategoryId(categories[0]?.id ?? "");
        }}
        className="fc-press flex h-12.5 cursor-pointer items-center justify-center gap-2 rounded-xl border-3 border-dashed border-ink bg-transparent font-body text-15 font-bold text-ink"
      >
        <Icon name="plus" size={16} />
        <span>Tambah anggaran kategori</span>
      </button>
    );
  }

  function save() {
    startTransition(async () => {
      const result = await setBudgetAction(categoryId, amount);
      if (result.status === "error") {
        setError(result.message);
        return;
      }
      setOpen(false);
      setAmount("");
      setError(undefined);
    });
  }

  return (
    <section aria-label="Tambah anggaran kategori" className="flex flex-col gap-3 rounded-xl border-3 border-dashed border-ink bg-paper p-3.5">
      <label className="flex flex-col gap-1.5 text-13 font-bold">
        Kategori
        <select
          value={categoryId}
          onChange={(event) => setCategoryId(event.target.value)}
          className={fieldVariants({ size: 46, className: "px-2.5" })}
        >
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </label>
      <MoneyInput id="new-budget-amount" label="Batas per bulan" tone="pink" value={amount} onValueChange={setAmount} error={error} />
      <div className="flex gap-2">
        <Button tone="orange" size={44} font="body-xs" loading={pending} onClick={save}>
          Simpan anggaran
        </Button>
        <Button tone="paper" size={44} font="body-xs" disabled={pending} onClick={() => setOpen(false)}>
          Batal
        </Button>
      </div>
    </section>
  );
}
