import { ButtonLink, Button } from "@/shared/ui/primitives/button";
import { Icon } from "@/shared/ui/primitives/icon";
import { MonthSwitcher } from "@/shared/ui/layout/month-switcher";
import { SummaryStrip } from "@/shared/ui/layout/summary-strip";
import { Amount } from "../components/amount";
import { TransactionTable } from "../components/transaction-table";
import { TransactionsMobile } from "../components/transactions-mobile";
import type { TransactionFirstPage } from "../components/use-transaction-list";
import type { CategoryOptionVM, MonthNavVM, SummaryStripVM, TransactionListFilters } from "../view-models/transaction-view-model";

export type TransactionsScreenVM = {
  monthNav: MonthNavVM;
  summary: SummaryStripVM;
  filters: TransactionListFilters;
  /** Halaman pertama dari GET /transactions. Halaman berikutnya dimuat lewat tombol "Muat lebih banyak". */
  firstPage: TransactionFirstPage;
  /** Jumlah semua transaksi bulan ini, dari GET /summary. */
  totalCount: number;
  /** Kategori bawaan dan kustom dari GET /categories, untuk filter Kategori. */
  categories: CategoryOptionVM[];
  accounts: string[];
};

/** Layar Transaksi: daftar bergrup per hari (mobile) dan tabel + aksi massal (desktop). */
export function TransactionsScreen({ vm }: { vm: TransactionsScreenVM }) {
  return (
    <>
      <div className="lg:hidden">
        <header className="flex flex-col gap-3 px-5 pt-4">
          <div className="flex items-center justify-between gap-3">
            <h1 className="m-0 font-display text-28 font-bold">Transaksi</h1>
            <MonthSwitcher label={vm.monthNav.shortLabel} prevHref={vm.monthNav.prevHref} nextHref={vm.monthNav.nextHref} />
          </div>
          <SummaryStrip {...vm.summary} />
        </header>
        <TransactionsMobile filters={vm.filters} firstPage={vm.firstPage} />
      </div>

      <div className="hidden flex-col gap-5 px-8 pt-7 pb-10 lg:flex">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4">
            <h1 className="m-0 font-display text-36 font-bold">Transaksi</h1>
            <MonthSwitcher size="md" label={vm.monthNav.label} prevHref={vm.monthNav.prevHref} nextHref={vm.monthNav.nextHref} />
          </div>
          <div className="flex flex-wrap gap-3">
            {/* TODO(transaction): ekspor CSV lewat route handler saat fitur ekspor dikerjakan. */}
            <Button tone="paper" size={46} font="body-xs" elevation={1} className="gap-2">
              <Icon name="download" size={18} />
              <span>Ekspor CSV</span>
            </Button>
            <ButtonLink href="/transactions/new" tone="paper" size={46} font="body-xs" elevation={1} className="gap-2">
              <Icon name="plus" size={18} />
              <span>Form manual</span>
            </ButtonLink>
          </div>
        </div>

        <section aria-label="Ringkasan bulan ini" className="grid grid-cols-[repeat(auto-fit,minmax(11.25rem,1fr))] gap-4">
          <SummaryCell label="MASUK" value={vm.summary.totalIn} direction="in" />
          <SummaryCell label="KELUAR" value={vm.summary.totalOut} direction="out" />
          <SummaryCell label="SELISIH" value={vm.summary.net} direction="neutral" />
        </section>

        <TransactionTable
          filters={vm.filters}
          firstPage={vm.firstPage}
          totalCount={vm.totalCount}
          categories={vm.categories}
          accounts={vm.accounts}
          monthLabel={vm.monthNav.label}
        />
      </div>
    </>
  );
}

function SummaryCell({ label, value, direction }: { label: string; value: string; direction: "in" | "out" | "neutral" }) {
  return (
    <div className="flex flex-col gap-1 rounded-xl border-3 border-ink bg-paper px-4 py-3">
      <span className="text-12 font-bold text-ink-600">{label}</span>
      <Amount value={value} direction={direction} size={22} />
    </div>
  );
}
