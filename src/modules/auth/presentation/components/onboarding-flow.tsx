"use client";

import { cva } from "class-variance-authority";
import Link from "next/link";
import { useState } from "react";
import { Button, ButtonLink } from "@/shared/ui/primitives/button";
import { Koko } from "@/shared/ui/primitives/koko";
import { MoneyInput } from "@/shared/ui/primitives/money-input";
import { PixelProgress } from "@/shared/ui/primitives/pixel-progress";
import { TextField } from "@/shared/ui/primitives/text-field";

const BUBBLES = [
  "Hai! Aku Koko, koin penjaga dompetmu. Kenalan dulu, yuk.",
  "Mulai dari angka yang ada sekarang. Nggak perlu sempurna.",
  "Pilih ritme yang paling nyaman. Bisa diubah di Pengaturan.",
  "Terakhir! Akun mana saja yang mau kamu pantau?",
] as const;

const PREFS = [
  { id: "daily", title: "Catat tiap transaksi", desc: "Paling detail, cocok buat yang rajin." },
  { id: "weekly", title: "Ringkasan mingguan", desc: "Isi sekali seminggu, santai." },
  { id: "budget", title: "Fokus anggaran", desc: "Pantau batas belanja per kategori." },
] as const;

const ACCOUNTS = [
  { id: "cash", label: "Tunai" },
  { id: "bank", label: "Rekening bank" },
  { id: "ewallet", label: "E-wallet" },
  { id: "credit", label: "Kartu kredit" },
] as const;

const optionCard = cva("fc-press flex border-3 border-ink font-body text-left text-ink shadow-hard-2", {
  variants: {
    kind: {
      pref: "min-h-18 items-center gap-3 rounded-xl px-3.5 py-3",
      account: "min-h-22 flex-col items-start justify-between gap-2 rounded-xl p-3",
    },
    on: { true: "", false: "bg-paper" },
  },
  compoundVariants: [
    { kind: "pref", on: true, className: "bg-orange-100" },
    { kind: "account", on: true, className: "bg-cyan-100" },
  ],
});

function Dot({ on }: { on: boolean }) {
  return (
    <span aria-hidden="true" className="flex size-5.5 flex-none items-center justify-center border-3 border-ink bg-field">
      <span className={on ? "size-2.5 bg-ink" : "size-2.5"} />
    </span>
  );
}

/**
 * Onboarding 4 langkah. TODO(onboarding): simpan nama tampilan, saldo awal, preferensi,
 * dan akun lewat use case saat endpoint profil/akun tersedia. Sekarang hanya alur UI.
 */
export function OnboardingFlow({ defaultName }: { defaultName: string }) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState(defaultName);
  const [balance, setBalance] = useState("");
  const [pref, setPref] = useState<(typeof PREFS)[number]["id"]>("daily");
  const [accounts, setAccounts] = useState<Record<string, boolean>>({ cash: true, bank: true });

  return (
    <>
      <div className="flex items-center justify-between gap-3 px-5 pt-4">
        <div className="text-13 font-bold">Langkah {step} dari 4</div>
        <Link href="/dashboard" className="px-1 py-3 text-15 font-bold">
          Lewati
        </Link>
      </div>
      <div className="px-5 pt-1">
        <PixelProgress size="md" segments={4} filled={step} tone={["over", "warn", "pink", "safe"]} label="Progres onboarding" valueMin={1} valueMax={4} valueNow={step} />
      </div>

      <div className="flex flex-1 flex-col gap-4.5 px-5 pt-5.5 pb-5">
        <div className="flex items-center gap-3">
          <Koko size={64} />
          <div className="relative flex-1 rounded-xl border-3 border-ink bg-paper px-3 py-2.5 text-14 leading-[1.4]">{BUBBLES[step - 1]}</div>
        </div>

        {step === 1 && (
          <>
            <h1 className="m-0 font-display text-26 font-bold">Mau dipanggil apa?</h1>
            <TextField id="ob-name" label="Nama tampilan" autoComplete="nickname" placeholder="Misal: Rani" size={52} value={name} onChange={(event) => setName(event.target.value)} hint="Diambil dari akun Google-mu, boleh diganti." />
          </>
        )}
        {step === 2 && (
          <>
            <h1 className="m-0 font-display text-26 font-bold">Saldo awal kamu</h1>
            <MoneyInput id="ob-bal" label="Total uang saat ini (opsional)" value={balance} onValueChange={setBalance} hint="Perkiraan saja cukup. Bisa dirinci per akun nanti." />
          </>
        )}
        {step === 3 && (
          <>
            <h1 className="m-0 font-display text-26 font-bold">Gaya mencatatmu?</h1>
            <div role="radiogroup" aria-label="Preferensi pencatatan" className="flex flex-col gap-2.5">
              {PREFS.map((item) => (
                <button key={item.id} type="button" role="radio" aria-checked={pref === item.id} onClick={() => setPref(item.id)} className={optionCard({ kind: "pref", on: pref === item.id })}>
                  <Dot on={pref === item.id} />
                  <span className="flex flex-col gap-0.5">
                    <span className="text-16 font-bold">{item.title}</span>
                    <span className="text-13 text-ink-600">{item.desc}</span>
                  </span>
                </button>
              ))}
            </div>
          </>
        )}
        {step === 4 && (
          <>
            <h1 className="m-0 font-display text-26 font-bold">Uangmu ada di mana?</h1>
            <div className="grid grid-cols-2 gap-2.5">
              {ACCOUNTS.map((item) => {
                const on = Boolean(accounts[item.id]);
                return (
                  <button key={item.id} type="button" aria-pressed={on} onClick={() => setAccounts((current) => ({ ...current, [item.id]: !on }))} className={optionCard({ kind: "account", on })}>
                    <Dot on={on} />
                    <span className="text-15 font-bold">{item.label}</span>
                  </button>
                );
              })}
            </div>
            <div className="text-12 text-ink-600">Pilih sebanyak yang kamu pakai. Nama & saldo per akun diatur di menu Akun.</div>
          </>
        )}

        <div className="mt-auto flex gap-3">
          {step > 1 && (
            <Button tone="paper" font="body" className="px-4.5" onClick={() => setStep((value) => value - 1)}>
              Kembali
            </Button>
          )}
          {step < 4 ? (
            <Button tone="cyan" className="flex-1" onClick={() => setStep((value) => value + 1)}>
              Lanjut
            </Button>
          ) : (
            <ButtonLink href="/dashboard" tone="coral" className="flex-1">
              Ke dashboard
            </ButtonLink>
          )}
        </div>
      </div>
    </>
  );
}
