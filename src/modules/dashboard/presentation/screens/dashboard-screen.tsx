import Link from "next/link";
import { ProfileMenu } from "@/modules/auth/presentation/components/profile-menu";
import { BudgetLine } from "@/modules/budget/presentation/components/budget-row";
import { TransactionRow, TransactionRowList } from "@/modules/transaction/presentation/components/transaction-row";
import { MonthSwitcher } from "@/shared/ui/layout/month-switcher";
import { StatCard } from "@/shared/ui/layout/stat-card";
import { Card } from "@/shared/ui/primitives/card";
import { EmptyState } from "@/shared/ui/primitives/empty-state";
import { Icon } from "@/shared/ui/primitives/icon";
import type { DashboardVM } from "../view-models/dashboard-view-model";

/** Beranda: ringkasan saldo, transaksi terbaru, dan anggaran (mobile + desktop). */
export function DashboardScreen({ vm }: { vm: DashboardVM }) {
  return (
    <>
      <MobileDashboard vm={vm} />
      <DesktopDashboard vm={vm} />
    </>
  );
}

function MobileDashboard({ vm }: { vm: DashboardVM }) {
  return (
    <div className="relative flex flex-col lg:hidden">
      <header className="flex items-center justify-between gap-3 px-5 pt-4 pb-3">
        <div className="flex flex-col gap-0.5">
          <div className="text-13 font-semibold text-ink-600">Halo,</div>
          <div className="font-display text-26 leading-none font-bold">{vm.user.name}</div>
        </div>
        <ProfileMenu user={vm.user} />
      </header>

      <div className="flex flex-col gap-4 px-5 pt-1 pb-4">
        <StatCard as="section" ariaLabel="Saldo" tone="cyan" size="hero" label="Total saldo" value={vm.balance.total} caption={vm.balance.caption} />
        <section aria-label="Ringkasan bulan ini" className="grid grid-cols-2 gap-3">
          <StatCard size="compact" dot="cyan" label={vm.income.label} value={vm.income.value} />
          <StatCard size="compact" dot="coral" label={vm.expense.label} value={vm.expense.value} />
        </section>

        <section aria-labelledby="recent-title" className="flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <h2 id="recent-title" className="m-0 font-display text-20 font-bold">
              Transaksi terbaru
            </h2>
            <Link href="/transactions" className="py-2.5 text-14 font-bold">
              Lihat semua
            </Link>
          </div>
          {vm.recentMobile.length > 0 ? (
            <Card as="div" elevation={2}>
              <TransactionRowList>
                {vm.recentMobile.map((row) => (
                  <li key={row.id}>
                    <TransactionRow row={row} meta={row.meta} href={`/transactions/edit?id=${encodeURIComponent(row.id)}`} density="roomy" />
                  </li>
                ))}
              </TransactionRowList>
            </Card>
          ) : (
            <EmptyState title="Belum ada transaksi" body="Ketuk tombol + untuk mencatat yang pertama." />
          )}
        </section>

        <Link href="/quick-add" className="fc-press flex items-center gap-3 rounded-2xl border-3 border-ink bg-orange-100 px-3.5 py-3 text-ink no-underline shadow-hard-2 hover:text-ink">
          <span aria-hidden="true" className="flex size-11 flex-none items-center justify-center rounded-lg border-2 border-ink bg-coral">
            <Icon name="mic" size={22} />
          </span>
          <span className="flex flex-1 flex-col gap-0.5">
            <span className="text-15 font-bold">Catat sambil ngobrol</span>
            <span className="text-13 text-ink-600">Coba bilang: “kopi 22 ribu pakai bank”</span>
          </span>
          <Icon name="chevron-right" size={18} />
        </Link>
      </div>
    </div>
  );
}

function DesktopDashboard({ vm }: { vm: DashboardVM }) {
  return (
    <div className="hidden flex-col gap-6 px-8 pt-7 pb-10 lg:flex">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="m-0 font-display text-36 font-bold">Halo, {vm.user.firstName}</h1>
          <div className="text-15 text-ink-600">{vm.dateLine}</div>
        </div>
        <MonthSwitcher size="md" label={vm.monthNav.label} prevHref={vm.monthNav.prevHref} nextHref={vm.monthNav.nextHref} />
      </div>

      <section aria-label="Ringkasan" className="grid grid-cols-[repeat(auto-fit,minmax(12.5rem,1fr))] gap-5">
        <StatCard tone="cyan" label="Total saldo" value={vm.balance.total} caption={vm.balance.caption} />
        <StatCard dot="cyan" label={vm.income.label} value={vm.income.value} caption={vm.income.caption} />
        <StatCard dot="coral" label={vm.expense.label} value={vm.expense.value} caption={vm.expense.caption} />
        <StatCard tone="pink" label="Sisa anggaran" value={vm.budget.remaining} caption={vm.budget.caption} />
      </section>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(20rem,1fr))] items-start gap-5">
        <Card as="section" aria-labelledby="dh-recent" elevation={3} className="overflow-hidden">
          <PanelHeader id="dh-recent" title="Transaksi terbaru" href="/transactions" action="Lihat semua" />
          {vm.recentDesktop.length > 0 ? (
            <TransactionRowList>
              {vm.recentDesktop.map((row) => (
                <li key={row.id}>
                  <TransactionRow row={row} meta={row.meta} href={`/transactions/edit?id=${encodeURIComponent(row.id)}`} density="desktop" tileSize={38} />
                </li>
              ))}
            </TransactionRowList>
          ) : (
            <p className="m-0 p-6 text-center text-14 text-ink-600">Belum ada transaksi di bulan ini.</p>
          )}
        </Card>
        <Card as="section" aria-labelledby="dh-budget" elevation={3} className="overflow-hidden">
          <PanelHeader id="dh-budget" title="Anggaran" href="/budget" action="Atur" />
          {vm.budget.empty ? (
            <p className="m-0 p-6 text-center text-14 text-ink-600">Belum ada anggaran. Atur batas belanja per kategori di menu Anggaran.</p>
          ) : (
            <ul className="m-0 flex list-none flex-col gap-3.5 px-4 pt-2 pb-3.5">
              {vm.budget.rows.map((row) => (
                <BudgetLine key={row.categoryId} row={row} />
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}

function PanelHeader({ id, title, href, action }: { id: string; title: string; href: string; action: string }) {
  return (
    <div className="flex items-center justify-between border-b-3 border-ink px-4 py-3.5">
      <h2 id={id} className="m-0 font-display text-22 font-bold">
        {title}
      </h2>
      <Link href={href} className="py-2 text-14 font-bold">
        {action}
      </Link>
    </div>
  );
}
