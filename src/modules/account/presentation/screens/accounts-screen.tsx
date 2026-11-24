import { cn } from "@/shared/lib/cn";
import { Card } from "@/shared/ui/primitives/card";
import { CategoryTile } from "@/shared/ui/primitives/category-tile";
import { EmptyState } from "@/shared/ui/primitives/empty-state";
import { AddAccountForm } from "../components/add-account-form";
import type { AccountsScreenVM } from "../view-models/account-view-model";

/**
 * Layar Akun: total saldo, daftar akun dengan saldo saat ini, dan form tambah akun.
 * Belum ada desain khusus di design/*.dc.html, jadi tata letaknya mengikuti layar Anggaran.
 */
export function AccountsScreen({ vm }: { vm: AccountsScreenVM }) {
  return (
    <div className="mx-auto flex w-full max-w-160 flex-col lg:pt-4">
      <header className="flex flex-col gap-0.5 px-5 pt-4 pb-2.5">
        <h1 className="m-0 font-display text-28 font-bold">Akun</h1>
        <div className="text-13 font-semibold text-ink-600">{vm.subtitle}</div>
      </header>

      <div className="flex flex-col gap-4 px-5 pt-1.5 pb-5">
        <Card as="section" aria-label="Total saldo" tone="cyan" className="flex flex-col gap-1.5 p-4.5">
          <div className="text-13 font-bold">Total saldo</div>
          <div className="fc-num text-34 leading-none font-bold">{vm.total}</div>
        </Card>

        {vm.rows.length === 0 ? (
          <EmptyState withKoko={false} title="Belum ada akun" body="Tambahkan akun tempat uangmu disimpan, misalnya Tunai atau rekening bank." />
        ) : (
          <ul className="m-0 flex list-none flex-col gap-2.5 p-0">
            {vm.rows.map((row) => (
              <li key={row.id}>
                <Card as="div" elevation={2} radius="xl" className="flex items-center gap-3 px-4 py-3">
                  <CategoryTile initial={row.initial} tone="paper" size={36} />
                  <div className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate text-15 font-bold">{row.name}</span>
                    <span className="text-12 text-ink-600">
                      {row.kindLabel} · {row.caption}
                    </span>
                  </div>
                  <span className={cn("fc-num text-16 font-bold", row.negative && "text-danger")}>{row.balance}</span>
                </Card>
              </li>
            ))}
          </ul>
        )}

        <AddAccountForm />
      </div>
    </div>
  );
}
