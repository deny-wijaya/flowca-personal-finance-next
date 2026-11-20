import { cva, type VariantProps } from "class-variance-authority";

/** Kartu retro: border tinta 3px + bayangan keras sesuai elevasi. */
export const cardVariants = cva("border-ink text-ink", {
  variants: {
    elevation: {
      flat: "",
      2: "shadow-hard-2",
      3: "shadow-hard-3",
      4: "shadow-hard-4",
      5: "shadow-hard-5",
    },
    tone: {
      paper: "bg-paper",
      cream: "bg-cream",
      cyan: "bg-cyan",
      pink: "bg-pink",
      "orange-100": "bg-orange-100",
      transparent: "bg-transparent",
    },
    border: { solid: "border-3 border-solid", dashed: "border-3 border-dashed" },
    radius: { xl: "rounded-xl", "2xl": "rounded-2xl", "3xl": "rounded-3xl" },
  },
  defaultVariants: { elevation: 4, tone: "paper", border: "solid", radius: "2xl" },
});

export type CardVariants = VariantProps<typeof cardVariants>;
