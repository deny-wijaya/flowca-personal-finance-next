import type { ComponentPropsWithoutRef, ElementType } from "react";
import { cn } from "@/shared/lib/cn";
import { cardVariants, type CardVariants } from "./card.variants";

type CardProps<T extends ElementType> = { as?: T } & CardVariants & Omit<ComponentPropsWithoutRef<T>, "as">;

/** Kartu dengan elemen semantik lewat `as` (section, ul, li, form, ...). */
export function Card<T extends ElementType = "div">({ as, elevation, tone, border, radius, className, ...props }: CardProps<T>) {
  const Component: ElementType = as ?? "div";
  return <Component className={cn(cardVariants({ elevation, tone, border, radius }), className)} {...props} />;
}
