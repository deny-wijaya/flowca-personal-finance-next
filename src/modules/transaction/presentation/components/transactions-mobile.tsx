"use client";

import { Button } from "@/shared/ui/primitives/button";
import { Card } from "@/shared/ui/primitives/card";
import { Chip } from "@/shared/ui/primitives/chip";
import { EmptyState } from "@/shared/ui/primitives/empty-state";
import { Icon } from "@/shared/ui/primitives/icon";
import { fieldVariants } from "@/shared/ui/primitives/field.variants";
import { groupRows, hasActiveFilter, TYPE_FILTERS, type TransactionListFilters } from "../view-models/transaction-view-model";
import { TransactionRow, TransactionRowList } from "./transaction-row";
import { useSearchQuery, useTransactionList, type TransactionFirstPage } from "./use-transaction-list";

/**
 * Pencarian + filter jenis + daftar bergrup per hari (layar Transaksi mobile).
 * Pencarian dan filter dikerjakan backend lewat URL, dan halaman berikutnya dimuat lewat "Muat lebih banyak".
 */
export function TransactionsMobile({ filters, firstPage }: { filters: TransactionListFilters; firstPage: TransactionFirstPage }) {
  const list = useTransactionList(filters, firstPage);
  const [query, setQuery] = useSearchQuery(filters.q, (q) => list.setFilters({ q }));
  const groups = groupRows(list.rows);
  const filtered = hasActiveFilter(filters);

  return (
    <>
      <div className="flex flex-col gap-3 px-5 pt-3 pb-2.5">
        <SearchBox id="tx-search" value={query} onChange={setQuery} placeholder="Cari transaksi atau kategori" />
        <div role="radiogroup" aria-label="Filter jenis" className="flex gap-2">
          {TYPE_FILTERS.map((filter) => (
            <Chip key={filter.id} behavior="radio" selected={filters.type === filter.id} onClick={() => list.setFilters({ type: filter.id })}>
              {filter.label}
            </Chip>
          ))}
        </div>
      </div>

      <div aria-busy={list.isFiltering} className="flex flex-col gap-3.5 px-5 pt-1 pb-6">
        {groups.map((group) => (
          <section key={group.key} aria-label={group.label} className="flex flex-col gap-1.5">
            <div className="flex justify-between px-1 text-12 font-bold text-ink-600">
              <span>{group.label}</span>
              <span className="fc-num">{group.sum}</span>
            </div>
            <Card as="div" elevation={2} radius="xl">
              <TransactionRowList>
                {group.rows.map((row) => (
                  <li key={row.id}>
                    <TransactionRow row={row} meta={row.meta} href={`/transactions/edit?id=${encodeURIComponent(row.id)}`} />
                  </li>
                ))}
              </TransactionRowList>
            </Card>
          </section>
        ))}
        {groups.length === 0 && (
          <EmptyState
            withKoko={false}
            title={filtered ? "Tidak ditemukan" : "Belum ada transaksi"}
            body={filtered ? "Coba kata kunci atau filter lain." : "Ketuk tombol + untuk mencatat yang pertama."}
          />
        )}
        <LoadMore hasMore={list.hasMore} loading={list.isLoadingMore} error={list.error} onClick={list.loadMore} />
      </div>
    </>
  );
}

/** Tombol "Muat lebih banyak" di bawah daftar mobile dan tabel desktop, plus pesan kalau gagal. */
export function LoadMore({ hasMore, loading, error, onClick }: { hasMore: boolean; loading: boolean; error: string | null; onClick: () => void }) {
  if (!hasMore && !error) return null;
  return (
    <div className="flex flex-col items-center gap-2">
      {error && (
        <p role="alert" className="m-0 text-14 font-semibold text-danger">
          {error}
        </p>
      )}
      {hasMore && (
        <Button tone="paper" size={46} font="body-xs" elevation={1} loading={loading} onClick={onClick}>
          {loading ? "Memuat..." : "Muat lebih banyak"}
        </Button>
      )}
    </div>
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
