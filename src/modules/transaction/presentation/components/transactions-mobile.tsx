"use client";

import { useState } from "react";
import { Card } from "@/shared/ui/primitives/card";
import { Chip } from "@/shared/ui/primitives/chip";
import { EmptyState } from "@/shared/ui/primitives/empty-state";
import { Icon } from "@/shared/ui/primitives/icon";
import { fieldVariants } from "@/shared/ui/primitives/field.variants";
import { formatRowsSum, matchesFilter, TYPE_FILTERS, type DayGroupVM, type TypeFilter } from "../view-models/transaction-view-model";
import { TransactionRow, TransactionRowList } from "./transaction-row";

/** Pencarian + filter jenis + daftar bergrup per hari (layar Transaksi mobile). */
export function TransactionsMobile({ groups }: { groups: DayGroupVM[] }) {
  const [query, setQuery] = useState("");
  const [type, setType] = useState<TypeFilter>("all");
  const hasData = groups.length > 0;

  const visible = groups
    .map((group) => {
      const rows = group.rows.filter((row) => matchesFilter(row, { query, type }));
      return { ...group, rows, sum: rows.length === group.rows.length ? group.sum : formatRowsSum(rows) };
    })
    .filter((group) => group.rows.length > 0);

  return (
    <>
      <div className="flex flex-col gap-3 px-5 pt-3 pb-2.5">
        <SearchBox id="tx-search" value={query} onChange={setQuery} placeholder="Cari transaksi atau kategori" />
        <div role="radiogroup" aria-label="Filter jenis" className="flex gap-2">
          {TYPE_FILTERS.map((filter) => (
            <Chip key={filter.id} behavior="radio" selected={type === filter.id} onClick={() => setType(filter.id)}>
              {filter.label}
            </Chip>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3.5 px-5 pt-1 pb-6">
        {visible.map((group) => (
          <section key={group.key} aria-label={group.label} className="flex flex-col gap-1.5">
            <div className="flex justify-between px-1 text-12 font-bold text-ink-600">
              <span>{group.label}</span>
              <span className="fc-num">{group.sum}</span>
            </div>
            <Card as="div" elevation={2} radius="xl">
              <TransactionRowList>
                {group.rows.map((row) => (
                  <li key={row.id}>
                    <TransactionRow row={row} meta={row.meta} href={`/transactions#${row.id}`} />
                  </li>
                ))}
              </TransactionRowList>
            </Card>
          </section>
        ))}
        {visible.length === 0 && (
          <EmptyState
            withKoko={false}
            title={hasData ? "Tidak ditemukan" : "Belum ada transaksi"}
            body={hasData ? "Coba kata kunci atau filter lain." : "Ketuk tombol + untuk mencatat yang pertama."}
          />
        )}
      </div>
    </>
  );
}

export function SearchBox({ id, value, onChange, placeholder, size = 48 }: { id: string; value: string; onChange: (value: string) => void; placeholder: string; size?: 46 | 48 }) {
  return (
    <div className="relative">
      <Icon name="search" size={18} className={size === 46 ? "absolute top-3.5 left-3.5 text-ink-600" : "absolute top-3.75 left-3.5 text-ink-600"} />
      <label htmlFor={id} className="fc-sr-only">
        Cari transaksi
      </label>
      <input
        id={id}
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className={fieldVariants({ size, border: "thick", className: size === 46 ? "pr-3 pl-10.5 text-15" : "pr-3.5 pl-10.5" })}
      />
    </div>
  );
}
