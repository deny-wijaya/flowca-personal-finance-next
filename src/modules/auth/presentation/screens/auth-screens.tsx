import Link from "next/link";
import { PrototypeBanner } from "@/shared/ui/layout/prototype-banner";
import { Icon, type IconName } from "@/shared/ui/primitives/icon";
import { Koko } from "@/shared/ui/primitives/koko";
import { ButtonLink } from "@/shared/ui/primitives/button";
import type { GoogleCallbackResult } from "../../domain/auth-gateway";
import { AuthCallbackProgress } from "../components/auth-callback-progress";
import { AuthColumn, AuthTopBar } from "../components/auth-parts";
import { ForgotPasswordFlow } from "../components/forgot-password-flow";
import { EnvelopeArt, LockArt } from "../components/illustrations";
import { LoginForm } from "../components/login-form";
import { OnboardingFlow } from "../components/onboarding-flow";
import { RegisterForm } from "../components/register-form";
import { ResetPasswordForm } from "../components/reset-password-form";

/**
 * Layar auth. Semua komponen murni: data & flag mode prototipe datang dari page.
 * Mobile mengikuti artboard 390px; di desktop tampil sebagai kolom kartu di tengah,
 * kecuali Masuk yang punya desain desktop sendiri.
 */

type PrototypeProps = { prototype: boolean };

const FEATURES: { icon: IconName; tone: string; title: string; body: string }[] = [
  { icon: "mic", tone: "bg-orange", title: "Catat sambil ngobrol", body: "Ketik atau ucapkan “kopi 22 ribu”, langsung jadi transaksi." },
  { icon: "cam", tone: "bg-pink", title: "Foto nota, beres", body: "Total dan item belanja terbaca dari foto nota." },
  { icon: "pie", tone: "bg-paper", title: "Anggaran yang jelas", body: "Lihat sisa per kategori sebelum kebablasan." },
];

export function LoginScreen({ prototype }: PrototypeProps) {
  return (
    <div className="flex min-h-dvh flex-col bg-cream">
      {prototype && <PrototypeBanner className="lg:px-6">MODE PROTOTIPE · autentikasi tiruan, belum terhubung ke server</PrototypeBanner>}

      <div className="mx-auto flex w-full max-w-97.5 flex-1 flex-col gap-4 px-5 pt-5 pb-4 lg:hidden">
        <div className="flex items-center gap-3">
          <Koko size={64} />
          <div className="flex flex-col gap-0.5">
            <div className="font-display text-30 leading-none font-bold">Flowca</div>
            <div className="text-14 text-ink-600">Teman kecil untuk keuangan harianmu.</div>
          </div>
        </div>
        <LoginForm variant="mobile" />
        <div className="mt-auto pb-1 text-center text-15">
          Belum punya akun?{" "}
          <Link href="/register" className="font-bold">
            Daftar sekarang.
          </Link>
        </div>
      </div>

      <div className="hidden flex-1 lg:flex">
        <section aria-label="Tentang Flowca" className="flex grow basis-130 flex-col gap-9 border-r-3 border-ink bg-cyan px-16 py-12">
          <div className="flex items-center gap-3">
            <Koko size={56} />
            <span className="font-display text-32 font-bold">Flowca</span>
          </div>
          <div className="flex max-w-130 flex-col gap-3.5">
            <p className="m-0 font-display text-52 leading-[1.05] font-bold">Uangmu, tercatat tanpa ribet.</p>
            <p className="m-0 text-18 leading-normal">Teman kecil untuk keuangan harianmu. Ngobrol saja, Koko yang mencatat.</p>
          </div>
          <ul className="m-0 flex max-w-120 list-none flex-col gap-4.5 p-0">
            {FEATURES.map((feature) => (
              <li key={feature.title} className="flex items-start gap-3.5">
                <span aria-hidden="true" className={`flex size-12 flex-none items-center justify-center rounded-lg border-3 border-ink shadow-hard-1 ${feature.tone}`}>
                  <Icon name={feature.icon} size={22} strokeWidth={2.6} strokeLinecap="square" />
                </span>
                <span className="flex flex-col gap-0.5">
                  <span className="text-17 font-bold">{feature.title}</span>
                  <span className="text-15">{feature.body}</span>
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-auto flex items-end justify-between gap-6">
            <span className="text-13 font-semibold">© 2026 Flowca</span>
            <Koko size={176} className="-mr-2" />
          </div>
        </section>
        <section aria-label="Masuk" className="flex grow basis-120 items-center justify-center px-8 py-12">
          <div className="flex w-full max-w-110 flex-col gap-5">
            <LoginForm variant="desktop" />
            <div className="text-center text-16">
              Belum punya akun?{" "}
              <Link href="/register" className="font-bold">
                Daftar sekarang.
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export function RegisterScreen({ prototype }: PrototypeProps) {
  return (
    <div className="flex min-h-dvh flex-col bg-cream">
      {prototype && <PrototypeBanner>MODE PROTOTIPE · akun tidak benar-benar dibuat</PrototypeBanner>}
      <AuthColumn className="gap-3.5 px-5 py-4">
        <AuthTopBar backHref="/login" />
        <div className="flex items-end gap-3">
          <div className="flex flex-1 flex-col gap-1">
            <h1 className="m-0 font-display text-28 leading-[1.1] font-bold">Bikin akun baru</h1>
            <p className="m-0 text-14 text-ink-600">Satu menit, lalu kita mulai rapikan keuanganmu.</p>
          </div>
          <Koko size={56} />
        </div>
        <RegisterForm />
        <div className="text-center text-15">
          Sudah punya akun?{" "}
          <Link href="/login" className="font-bold">
            Masuk di sini.
          </Link>
        </div>
      </AuthColumn>
    </div>
  );
}

export function ForgotPasswordScreen({ prototype }: PrototypeProps) {
  return (
    <div className="flex min-h-dvh flex-col bg-cream">
      {prototype && <PrototypeBanner>MODE PROTOTIPE · email tidak benar-benar dikirim</PrototypeBanner>}
      <AuthColumn className="gap-5 px-5 pt-4 pb-5">
        <AuthTopBar backHref="/login" />
        <div className="flex justify-center pt-3">
          <EnvelopeArt />
        </div>
        <ForgotPasswordFlow />
      </AuthColumn>
    </div>
  );
}

export type ResetPasswordScreenVM = { status: "valid"; token: string; email: string } | { status: "expired" };

export function ResetPasswordScreen({ prototype, vm }: PrototypeProps & { vm: ResetPasswordScreenVM }) {
  return (
    <div className="flex min-h-dvh flex-col bg-cream">
      {prototype && <PrototypeBanner>MODE PROTOTIPE · token reset tidak divalidasi server</PrototypeBanner>}
      <AuthColumn className="gap-4.5 px-5 pt-4 pb-5">
        <AuthTopBar />
        {vm.status === "valid" ? (
          <ResetPasswordForm token={vm.token} email={vm.email} />
        ) : (
          <>
            <div className="flex justify-center pt-2">
              <LockArt tone="coral" />
            </div>
            <div role="alert" className="flex flex-col gap-2 text-center">
              <h1 className="m-0 font-display text-28 font-bold">Link sudah kedaluwarsa</h1>
              <p className="m-0 text-15 leading-[1.45] text-ink-600">Demi keamanan, link reset hanya berlaku 30 menit dan sekali pakai. Minta link baru, ya.</p>
            </div>
            <ButtonLink href="/forgot-password" tone="cyan" block>
              Minta link baru
            </ButtonLink>
            <Link href="/login" className="py-2.5 text-center text-15 font-bold">
              Kembali ke login
            </Link>
          </>
        )}
      </AuthColumn>
    </div>
  );
}

export function AuthCallbackScreen({ prototype, result }: PrototypeProps & { result: GoogleCallbackResult }) {
  return (
    <div className="flex min-h-dvh flex-col bg-cream">
      {prototype && <PrototypeBanner>MODE PROTOTIPE · callback disimulasikan</PrototypeBanner>}
      <AuthColumn className="gap-5.5 px-5 py-6">
        <div className="self-center rounded-sm border-2 border-ink bg-paper px-2.5 py-1.5 font-mono text-12">/auth/callback?code=••••&amp;state=••••</div>
        <AuthCallbackProgress result={result} />
      </AuthColumn>
    </div>
  );
}

export function OnboardingScreen({ defaultName }: { defaultName: string }) {
  return (
    <div className="flex min-h-dvh flex-col bg-cream">
      <AuthColumn>
        <OnboardingFlow defaultName={defaultName} />
      </AuthColumn>
    </div>
  );
}
