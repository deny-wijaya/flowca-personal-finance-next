"use client";

import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps, ReactNode } from "react";
import { formatThousandsInput } from "@/shared/lib/format";
import { cn } from "@/shared/lib/cn";
import { fieldLabelClass, fieldMessageClass } from "./field.variants";

/**
 * Input nominal Rupiah: prefix "Rp" berwarna + angka berformat ribuan id-ID.
 * Nilai yang dikirim lewat `onValueChange` sudah berformat ("2.500.000").
 */
const moneyBoxVariants = cva("flex items-stretch overflow-hidden bg-field", {
  variants: {
    size: {
      md: "rounded-lg border-2",
      lg: "rounded-xl border-3 shadow-hard-2",
    },
    invalid: { true: "border-danger", false: "border-ink" },
  },
  defaultVariants: { size: "md", invalid: false },
});

const moneyPrefixVariants = cva("fc-num flex items-center border-ink font-bold", {
  variants: {
    size: { md: "border-r-2 px-3", lg: "border-r-3 px-3.5 text-22" },
    tone: {
      orange: "bg-orange-100",
      coral: "bg-coral",
      cyan: "bg-cyan",
      pink: "bg-pink",
    },
  },
  defaultVariants: { size: "md", tone: "orange" },
});

const moneyInputVariants = cva("fc-num min-w-0 flex-1 border-0 bg-transparent px-3.5 text-ink focus:outline-none", {
  variants: {
    size: { md: "h-13 text-22", lg: "h-16 text-34 font-bold" },
  },
  defaultVariants: { size: "md" },
});

type MoneyInputProps = Omit<ComponentProps<"input">, "size" | "prefix" | "value" | "onChange"> &
  VariantProps<typeof moneyPrefixVariants> & {
    id: string;
    label: ReactNode;
    value: string;
    onValueChange: (formatted: string) => void;
    prefix?: string;
    hint?: ReactNode;
    error?: string;
  };

export function MoneyInput({ id, label, value, onValueChange, prefix = "Rp", hint, error, size, tone, className, ...props }: MoneyInputProps) {
  const errorId = error ? `${id}-error` : undefined;
  const hintId = hint ? `${id}-hint` : undefined;

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={id} className={fieldLabelClass}>
        {label}
      </label>
      <div className={cn(moneyBoxVariants({ size, invalid: Boolean(error) }), "fc-field-group")}>
        <span className={moneyPrefixVariants({ size, tone })}>{prefix}</span>
        <input
          id={id}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          placeholder="0"
          value={value}
          onChange={(event) => onValueChange(formatThousandsInput(event.target.value))}
          aria-invalid={error ? true : undefined}
          aria-describedby={[errorId, hintId].filter(Boolean).join(" ") || undefined}
          className={moneyInputVariants({ size })}
          {...props}
        />
      </div>
      {error && (
        <div id={errorId} role="alert" className={cn(fieldMessageClass, "text-danger")}>
          {error}
        </div>
      )}
      {hint && (
        <div id={hintId} className="text-12 text-ink-600">
          {hint}
        </div>
      )}
    </div>
  );
}
