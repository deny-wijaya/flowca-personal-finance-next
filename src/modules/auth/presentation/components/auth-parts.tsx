import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/shared/lib/cn";
import { Card } from "@/shared/ui/primitives/card";
import { Icon } from "@/shared/ui/primitives/icon";
import { IconLink } from "@/shared/ui/primitives/icon-button";

/** Header layar auth: tombol kembali (opsional) + logo teks Flowca di tengah. */
export function AuthTopBar({ backHref, backLabel = "Kembali ke halaman masuk" }: { backHref?: string; backLabel?: string }) {
  return (
    <div className="flex h-11 items-center justify-between">
      {backHref ? (
        <IconLink href={backHref} aria-label={backLabel} elevation={1}>
          <Icon name="chevron-left" size={20} />
        </IconLink>
      ) : (
        <span className="w-11" />
      )}
      <div className="font-display text-22 font-bold">Flowca</div>
      <span className="w-11" />
    </div>
  );
}

const authCardClass = (size: "md" | "lg") =>
  cn("m-0 flex flex-col", size === "lg" ? "gap-4 p-8" : "gap-3.5 p-5");

/** Kartu putih auth (login, daftar, lupa & reset password). */
export function AuthCard({ size = "md", className, ...props }: ComponentProps<"div"> & { size?: "md" | "lg" }) {
  return <Card elevation={size === "lg" ? 5 : 4} radius={size === "lg" ? "3xl" : "2xl"} className={cn(authCardClass(size), className)} {...props} />;
}

/** Sama seperti AuthCard, tapi elemennya `<form>` (layar lupa & reset password). */
export function AuthFormCard({ className, ...props }: ComponentProps<"form">) {
  return <Card as="form" elevation={4} className={cn(authCardClass("md"), className)} {...props} />;
}

/** Kerangka kolom mobile 390px; di desktop tampil sebagai kartu di tengah layar. */
export function AuthColumn({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("mx-auto flex w-full max-w-97.5 flex-1 flex-col lg:max-w-110 lg:justify-center lg:py-12", className)}>{children}</div>;
}
