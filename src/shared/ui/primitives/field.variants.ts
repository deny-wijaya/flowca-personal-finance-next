import { cva, type VariantProps } from "class-variance-authority";

/** Kotak input: isi putih, border tinta, fokus = glow cyan (`.fc-field`). */
export const fieldVariants = cva("fc-field w-full min-w-0 bg-field font-body text-ink", {
  variants: {
    size: {
      42: "h-10.5 text-14",
      46: "h-11.5 text-16",
      48: "h-12 text-16",
      50: "h-12.5 text-16",
      52: "h-13 text-17",
    },
    border: { thin: "border-2", thick: "border-3" },
    radius: { lg: "rounded-lg", xl: "rounded-xl" },
    invalid: { true: "border-danger", false: "border-ink" },
  },
  defaultVariants: { size: 48, border: "thin", radius: "lg", invalid: false },
});

export type FieldVariants = VariantProps<typeof fieldVariants>;

export const fieldLabelClass = "text-13 font-bold";
export const fieldMessageClass = "text-12 font-semibold";
