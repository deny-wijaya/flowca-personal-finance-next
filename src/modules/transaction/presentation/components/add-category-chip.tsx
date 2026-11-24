"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { cn } from "@/shared/lib/cn";
import { Button } from "@/shared/ui/primitives/button";
import { Chip } from "@/shared/ui/primitives/chip";
import { fieldMessageClass, fieldVariants } from "@/shared/ui/primitives/field.variants";
import { Icon } from "@/shared/ui/primitives/icon";
import { createCategoryAction } from "../actions";
import type { CategoryOptionVM } from "../view-models/transaction-view-model";

type AddCategoryChipProps = {
  /** Jenis kategori baru, mengikuti jenis transaksi yang sedang dipilih di form. */
  type: "income" | "expense";
  /** Dipanggil setelah kategori tersimpan, supaya form menambah chip-nya dan langsung memilihnya. */
  onCreated: (category: CategoryOptionVM) => void;
};

/**
 * Chip "+ Kategori baru" di akhir deretan kategori pada form Tambah transaksi.
 * Saat diketuk, chip berubah menjadi kotak isian di tempat yang sama. Enter menyimpan, Esc membatalkan.
 * Kotak isian ini bukan <form> sendiri (form di dalam form tidak boleh di HTML), jadi Enter ditangani manual
 * supaya tidak ikut mengirim form transaksi.
 */
export function AddCategoryChip({ type, onCreated }: AddCategoryChipProps) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  // Kotak isian langsung siap diketik begitu muncul, tanpa perlu diketuk lagi.
  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  function open() {
    setEditing(true);
    setError(null);
  }

  function close() {
    setEditing(false);
    setName("");
    setError(null);
  }

  function save() {
    if (pending) return;
    startTransition(async () => {
      const result = await createCategoryAction({ name, type });
      if (result.status === "error") {
        setError(result.message);
        inputRef.current?.focus();
        return;
      }
      onCreated(result.category);
      close();
    });
  }

  if (!editing) {
    return (
      <Chip shape="tile" behavior="action" onClick={open} className="border-dashed">
        <Icon name="plus" size={22} />
        <span className="text-11 font-bold">Kategori baru</span>
      </Chip>
    );
  }

  return (
    <div className="col-span-4 flex flex-col gap-1.5">
      <label htmlFor="new-category" className="fc-sr-only">
        Nama kategori baru
      </label>
      <div className="flex gap-2">
        <input
          ref={inputRef}
          id="new-category"
          type="text"
          maxLength={30}
          value={name}
          placeholder={type === "income" ? "Misal: Jualan online" : "Misal: Kos"}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? "new-category-error" : undefined}
          onChange={(event) => {
            setName(event.target.value);
            setError(null);
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              save();
            } else if (event.key === "Escape") {
              event.preventDefault();
              close();
            }
          }}
          className={fieldVariants({ size: 46, invalid: Boolean(error), className: "min-w-0 flex-1 px-3.5" })}
        />
        <Button tone="cyan" size={46} font="body-xs" loading={pending} onClick={save}>
          Simpan
        </Button>
        <Button tone="paper" size={46} font="body-xs" onClick={close} disabled={pending}>
          Batal
        </Button>
      </div>
      {error && (
        <div id="new-category-error" role="alert" className={cn(fieldMessageClass, "text-danger")}>
          {error}
        </div>
      )}
    </div>
  );
}
