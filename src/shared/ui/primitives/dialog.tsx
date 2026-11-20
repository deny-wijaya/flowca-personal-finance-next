"use client";

import { cva, type VariantProps } from "class-variance-authority";
import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/shared/lib/cn";

/**
 * Sheet / Dialog di atas `<dialog>` asli: `showModal()` sudah mengunci fokus,
 * menutup dengan Esc, dan memberi `aria-modal`. Penutupan diteruskan ke `onClose`
 * supaya pemanggil yang memutuskan (mis. navigasi kembali).
 */
const dialogVariants = cva("m-0 max-h-none max-w-none border-ink bg-cream p-0 text-ink", {
  variants: {
    side: {
      /** Mobile: sheet penuh dari bawah, menyisakan 44px di atas. Desktop: panel kanan 400px. */
      responsive:
        "fixed inset-x-0 top-11 bottom-0 h-auto w-full rounded-t-sheet border-t-3 backdrop:bg-ink-300 lg:top-0 lg:right-0 lg:left-auto lg:h-full lg:w-100 lg:rounded-none lg:border-t-0 lg:border-l-3 lg:backdrop:bg-ink/25",
      center:
        "fixed inset-x-6 top-1/2 mx-auto h-fit w-auto max-w-sm -translate-y-1/2 rounded-2xl border-3 bg-paper shadow-hard-4 backdrop:bg-ink/55",
    },
  },
  defaultVariants: { side: "center" },
});

type DialogProps = VariantProps<typeof dialogVariants> & {
  onClose: () => void;
  labelledBy: string;
  children: ReactNode;
  className?: string;
};

export function Dialog({ side, onClose, labelledBy, children, className }: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (dialog && !dialog.open) dialog.showModal();
    return () => dialog?.close();
  }, []);

  return (
    <dialog
      ref={ref}
      aria-labelledby={labelledBy}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        // Klik di backdrop (area di luar kotak dialog) menutup dialog.
        if (event.target === event.currentTarget) {
          const rect = event.currentTarget.getBoundingClientRect();
          const inside = event.clientX >= rect.left && event.clientX <= rect.right && event.clientY >= rect.top && event.clientY <= rect.bottom;
          if (!inside) onClose();
        }
      }}
      className={cn(dialogVariants({ side }), className)}
    >
      {children}
    </dialog>
  );
}
