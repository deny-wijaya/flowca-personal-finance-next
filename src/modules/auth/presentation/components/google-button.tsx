import { cva } from "class-variance-authority";
import { cn } from "@/shared/lib/cn";
import { GoogleLogo } from "@/shared/ui/primitives/google-logo";
import { Icon } from "@/shared/ui/primitives/icon";
import { Spinner } from "@/shared/ui/primitives/spinner";

export type GoogleButtonStatus = "idle" | "loading" | "success" | "error";

/**
 * Tombol "Lanjutkan dengan Google" dengan 6 state (lihat GoogleStates.dc.html):
 * idle, hover & focus (lewat CSS), loading, success, error. State dikendalikan dari luar.
 */
const googleButtonVariants = cva(
  "fc-press flex w-full items-center justify-center gap-2.5 rounded-lg border-3 border-ink font-body font-bold text-ink shadow-hard-2 focus-visible:outline-offset-3",
  {
    variants: {
      status: { idle: "bg-field", loading: "bg-cyan-50", success: "bg-green-100", error: "bg-coral-100" },
      size: { 52: "h-13 text-16", 54: "h-13.5 text-16", spec: "h-13 text-15" },
    },
    defaultVariants: { status: "idle", size: 52 },
  },
);

type GoogleButtonProps = {
  status: GoogleButtonStatus;
  onClick?: () => void;
  size?: 52 | 54 | "spec";
  /** Teks saat idle, mis. "Daftar dengan Google". */
  idleLabel?: string;
  successLabel?: string;
  className?: string;
};

export function GoogleButton({ status, onClick, size, idleLabel = "Lanjutkan dengan Google", successLabel = "Berhasil (simulasi)", className }: GoogleButtonProps) {
  const loading = status === "loading";
  return (
    <button type="button" onClick={onClick} disabled={loading} aria-busy={loading || undefined} className={cn(googleButtonVariants({ status, size }), className)}>
      {status === "idle" && (
        <>
          <GoogleLogo size={size === "spec" ? 20 : 22} />
          <span>{idleLabel}</span>
        </>
      )}
      {loading && (
        <>
          <Spinner />
          <span>Menghubungkan ke Google…</span>
        </>
      )}
      {status === "success" && (
        <>
          <Icon name="check" size={20} />
          <span>{successLabel}</span>
        </>
      )}
      {status === "error" && (
        <>
          <Icon name="retry" size={20} />
          <span>Coba lagi dengan Google</span>
        </>
      )}
    </button>
  );
}
