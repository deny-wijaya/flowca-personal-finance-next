import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/shared/lib/cn";
import { buttonVariants, type ButtonVariants } from "./button.variants";
import { Spinner } from "./spinner";

type ButtonProps = ComponentProps<"button"> &
  ButtonVariants & {
    /** Tampilkan spinner, nonaktifkan tombol, dan set aria-busy. */
    loading?: boolean;
  };

export function Button({ tone, size, font, elevation, block, loading, disabled, className, children, type = "button", ...props }: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(buttonVariants({ tone, size, font, elevation, block }), className)}
      {...props}
    >
      {loading && <Spinner />}
      {children}
    </button>
  );
}

type ButtonLinkProps = Omit<ComponentProps<typeof Link>, "children"> & ButtonVariants & { children: ReactNode };

/** Tampilan tombol untuk navigasi (`<a>` asli lewat next/link). */
export function ButtonLink({ tone, size, font, elevation, block, className, ...props }: ButtonLinkProps) {
  return <Link className={cn(buttonVariants({ tone, size, font, elevation, block }), className)} {...props} />;
}
