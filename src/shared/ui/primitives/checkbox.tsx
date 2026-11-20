import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/shared/lib/cn";

type CheckboxProps = Omit<ComponentProps<"input">, "type"> & {
  label?: ReactNode;
  /** Ukuran kotak: 20px (form) atau 18px (tabel). */
  boxSize?: 18 | 20;
  labelClassName?: string;
};

/** Checkbox asli dengan accent tinta. Bila ada label, area klik minimal 44px. */
export function Checkbox({ label, boxSize = 20, className, labelClassName, ...props }: CheckboxProps) {
  const input = (
    <input type="checkbox" className={cn("m-0 flex-none accent-ink", boxSize === 20 ? "size-5" : "size-4.5", !label && className)} {...props} />
  );
  if (!label) return input;

  return (
    <label className={cn("flex min-h-11 cursor-pointer items-center gap-2 text-14", className, labelClassName)}>
      {input}
      <span>{label}</span>
    </label>
  );
}
