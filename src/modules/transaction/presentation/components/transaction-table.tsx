"use client";

import Link from "next/link";
import { useState } from "react";
import { cn } from "@/shared/lib/cn";
import { CategoryTile, categoryPillVariants } from "@/shared/ui/primitives/category-tile";
import { Checkbox } from "@/shared/ui/primitives/checkbox";
import { Chip } from "@/shared/ui/primitives/chip";
import { fieldVariants } from "@/shared/ui/primitives/field.variants";
import {
  categoryOptionLabel,
  hasActiveFilter,
  TYPE_FILTERS,
  type CategoryOptionVM,
  type TransactionListFilters,
  type TransactionRowVM,
} from "../view-models/transaction-view-model";
import { Amount } from "./amount";
import { BulkActionBar } from "./bulk-action-bar";
import { LoadMore, SearchBox } from "./transactions-mobile";
import { useSearchQuery, useTransactionList, type TransactionFirstPage } from "./use-transaction-list";

type SortKey = "date" | "amount";
type SortDir = "asc" | "desc";

type TransactionTableProps = {
  filters: TransactionListFilters;
  firstPage: TransactionFirstPage;
  /** Jumlah semua transaksi di bulan ini (dari GET /summary), untuk footer tabel. */
  totalCount: number;
  categories: CategoryOptionVM[];
  /** Akun dari GET /accounts, untuk filter Akun. */
  accounts: { id: string; name: string }[];
  /** "November 2026" untuk footer tabel. */
  monthLabel: string;
};

/**
 * Tabel transaksi desktop: cari, filter jenis/kategori/akun, urut, dan pilih massal.
 * Pencarian, jenis, kategori, dan akun dikerjakan backend lewat URL. Urutan kolom (klik judul kolom)
 * hanya berlaku untuk baris yang sudah dimuat.
 */
export function TransactionTable({ filters, firstPage, totalCount, categories, accounts, monthLabel }: TransactionTableProps) {
  const list = useTransactionList(filters, firstPage);
  const rows = list.rows;
  const [query, setQuery] = useSearchQuery(filters.q, (q) => list.setFilters({ q }));
  const [sort, setSort] = useState<{ key: SortKey; dir: SortDir }>({ key: "date", dir: "desc" });
  const [selected, setSelected] = useState<ReadonlySet<string>>(new Set());

  // Salinan dulu: sort() mengubah array aslinya, sedangkan `rows` adalah state milik useTransactionList.
  const shown = [...rows].sort((a, b) => {
    const diff = sort.key === "date" ? a.sortTime - b.sortTime : a.sortAmount - b.sortAmount;
    return sort.dir === "asc" ? diff : -diff;
  });

  const allSelected = shown.length > 0 && shown.every((row) => selected.has(row.id));
  const selectedCount = rows.filter((row) => selected.has(row.id)).length;

  function toggle(id: string) {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    setSelected((current) => {
      const next = new Set(current);
      for (const row of shown) {
        if (allSelected) next.delete(row.id);
        else next.add(row.id);
      }
      return next;
    });
  }

  function sortBy(key: SortKey) {
    setSort((current) => ({ key, dir: current.key === key && current.dir === "desc" ? "asc" : "desc" }));
  }

  const ariaSort = (key: SortKey) => (sort.key === key ? (sort.dir === "asc" ? "ascending" : "descending") : "none");
  const arrow = (key: SortKey) => (sort.key === key ? (sort.dir === "asc" ? "▲" : "▼") : "↕");

  return (
    <>
      <div className="flex flex-wrap items-center gap-3">
        <div className="max-w-90 min-w-65 flex-1">
          <SearchBox id="dt-q" size={46} value={query} onChange={setQuery} placeholder="Cari transaksi" />
        </div>
        <div role="radiogroup" aria-label="Jenis" className="flex gap-1.5">
          {TYPE_FILTERS.map((filter) => (
            <Chip key={filter.id} behavior="radio" selected={filters.type === filter.id} onClick={() => list.setFilters({ type: filter.id })} className="min-h-10.5">
              {filter.label}
            </Chip>
          ))}
        </div>
        <FilterSelect
          label="Kategori"
          value={filters.category}
          onChange={(category) => list.setFilters({ category })}
          options={categories.map((option) => ({ value: option.id, label: categoryOptionLabel(option) }))}
        />
        <FilterSelect
          label="Akun"
          value={filters.account}
          onChange={(account) => list.setFilters({ account })}
          options={accounts.map((account) => ({ value: account.id, label: account.name }))}
        />
      </div>

      {selectedCount > 0 && (
        <BulkActionBar
          selected={rows.filter((row) => selected.has(row.id)).map((row) => ({ id: row.id, direction: row.direction }))}
          categories={categories}
          accounts={accounts}
          onDone={() => setSelected(new Set())}
          onCancel={() => setSelected(new Set())}
        />
      )}

      <div aria-busy={list.isFiltering} className="overflow-x-auto rounded-2xl border-3 border-ink bg-paper shadow-hard-3">
        <table className="w-full min-w-180 border-collapse text-14">
          <thead>
            <tr className="border-b-3 border-ink bg-orange-100 text-left">
              <th scope="col" className="w-12 px-3.5 py-2.5">
                <Checkbox boxSize={18} aria-label="Pilih semua" checked={allSelected} onChange={toggleAll} />
              </th>
              <th scope="col" aria-sort={ariaSort("date")} className="px-2">
                <SortButton onClick={() => sortBy("date")} arrow={arrow("date")}>
                  Tanggal
                </SortButton>
              </th>
              <th scope="col" className="px-2 text-13">
                Deskripsi
              </th>
              <th scope="col" className="px-2 text-13">
                Kategori
              </th>
              <th scope="col" className="px-2 text-13">
                Akun
              </th>
              <th scope="col" aria-sort={ariaSort("amount")} className="pr-3.5 pl-2">
                <SortButton onClick={() => sortBy("amount")} arrow={arrow("amount")} className="ml-auto">
                  Jumlah
                </SortButton>
              </th>
            </tr>
          </thead>
          <tbody>
            {shown.map((row) => {
              const isSelected = selected.has(row.id);
              return (
                <tr key={row.id} className={cn("border-t-2 border-dashed border-sand-200 hover:bg-orange-50", isSelected ? "bg-orange-50" : "bg-paper")}>
                  <td className="px-3.5 py-2.5">
                    <Checkbox boxSize={18} aria-label={`Pilih ${row.name}`} checked={isSelected} onChange={() => toggle(row.id)} />
                  </td>
                  <td className="px-2 py-2.5 whitespace-nowrap">
                    <div className="font-bold">{row.dayLabel}</div>
                    <div className="text-12 text-ink-600">{row.time}</div>
                  </td>
                  <td className="px-2 py-2.5 font-bold">
                    {/* Membuka sheet "Ubah transaksi" (ubah atau hapus satu transaksi). */}
                    <Link href={`/transactions/edit?id=${encodeURIComponent(row.id)}`} className="text-ink underline decoration-sand-200 underline-offset-4 hover:decoration-ink">
                      {row.name}
                    </Link>
                  </td>
                  <td className="px-2 py-2.5">
                    <CategoryPill row={row} />
                  </td>
                  <td className="px-2 py-2.5">{row.account}</td>
                  <td className="py-2.5 pr-3.5 pl-2 text-right">
                    <Amount value={row.amount} direction={row.direction} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {shown.length === 0 && <div className="p-8 text-center text-15 text-ink-600">Tidak ada transaksi yang cocok dengan filter ini.</div>}
        <div className="border-t-3 border-ink px-4 py-3 text-13 text-ink-600">
          {hasActiveFilter(filters)
            ? `Menampilkan ${shown.length} transaksi yang cocok · ${monthLabel}`
            : `Menampilkan ${shown.length} dari ${totalCount} transaksi · ${monthLabel}`}
        </div>
      </div>
      <LoadMore hasMore={list.hasMore} loading={list.isLoadingMore} error={list.error} onClick={list.loadMore} />
    </>
  );
}

function CategoryPill({ row }: { row: TransactionRowVM }) {
  return (
    <span className={categoryPillVariants({ tone: row.tone })}>
      <CategoryTile initial={row.initial} tone="paper" size={18} />
      {row.category}
    </span>
  );
}

function SortButton({ onClick, arrow, className, children }: { onClick: () => void; arrow: string; className?: string; children: string }) {
  return (
    <button type="button" onClick={onClick} className={cn("flex h-11 cursor-pointer items-center gap-1 border-0 bg-transparent font-body text-13 font-bold text-ink", className)}>
      {children} <span aria-hidden="true">{arrow}</span>
    </button>
  );
}

function FilterSelect({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: { value: string; label: string }[] }) {
  return (
    <label className="flex items-center gap-2 text-13 font-bold">
      {label}
      <select value={value} onChange={(event) => onChange(event.target.value)} className={fieldVariants({ size: 42, className: "w-auto px-2.5" })}>
        <option value="">Semua</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
