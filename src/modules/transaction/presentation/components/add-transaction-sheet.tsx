"use client";

import { useRouter } from "next/navigation";
import type { ComponentProps } from "react";
import { Dialog } from "@/shared/ui/primitives/dialog";
import { AddTransactionForm } from "./add-transaction-form";

/** Bottom sheet penuh (mobile) / panel kanan 400px (desktop) berisi form tambah transaksi. */
export function AddTransactionSheet(props: ComponentProps<typeof AddTransactionForm>) {
  const router = useRouter();
  return (
    <Dialog side="responsive" labelledBy="add-title" onClose={() => router.push(props.closeHref)} className="open:flex open:flex-col">
      <div aria-hidden="true" className="mt-2.5 h-1.5 w-12 flex-none self-center bg-ink lg:hidden" />
      <AddTransactionForm {...props} />
    </Dialog>
  );
}
