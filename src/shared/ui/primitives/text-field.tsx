import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/shared/lib/cn";
import { fieldLabelClass, fieldMessageClass, fieldVariants, type FieldVariants } from "./field.variants";

type TextFieldProps = Omit<ComponentProps<"input">, "size" | "prefix"> &
  Omit<FieldVariants, "invalid"> & {
    id: string;
    label: ReactNode;
    hint?: ReactNode;
    error?: string;
    /** Elemen di kanan dalam input, mis. tombol lihat password. */
    trailing?: ReactNode;
    labelClassName?: string;
    messageClassName?: string;
  };

/**
 * Field teks dengan label, hint, dan pesan error yang terhubung lewat
 * `aria-describedby`. Komponen tanpa hook supaya bisa dirender di server.
 */
export function TextField({
  id,
  label,
  hint,
  error,
  trailing,
  size,
  border,
  radius,
  className,
  labelClassName,
  messageClassName,
  ...props
}: TextFieldProps) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [errorId, hintId].filter(Boolean).join(" ") || undefined;

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={id} className={cn(fieldLabelClass, labelClassName)}>
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={cn(fieldVariants({ size, border, radius, invalid: Boolean(error) }), "px-3.5", trailing ? "pr-13" : undefined)}
          {...props}
        />
        {trailing}
      </div>
      {error && (
        <div id={errorId} className={cn(fieldMessageClass, "text-danger", messageClassName)}>
          {error}
        </div>
      )}
      {hint && (
        <div id={hintId} className={cn("text-12 text-ink-600", messageClassName)}>
          {hint}
        </div>
      )}
    </div>
  );
}
