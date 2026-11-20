"use client";

import { useState, type ComponentProps } from "react";
import { cn } from "@/shared/lib/cn";
import { Icon } from "./icon";
import { TextField } from "./text-field";

type PasswordFieldProps = Omit<ComponentProps<typeof TextField>, "type" | "trailing"> & {
  /** "icon" = ikon mata (mobile), "text" = teks Lihat/Tutup (desktop login). */
  toggleStyle?: "icon" | "text";
};

/** TextField + tombol lihat/sembunyikan password (`aria-pressed`). */
export function PasswordField({ toggleStyle = "icon", ...props }: PasswordFieldProps) {
  const [shown, setShown] = useState(false);

  return (
    <TextField
      {...props}
      type={shown ? "text" : "password"}
      trailing={
        <button
          type="button"
          onClick={() => setShown((value) => !value)}
          aria-label={shown ? "Sembunyikan password" : "Tampilkan password"}
          aria-pressed={shown}
          className={cn(
            "absolute top-0.5 right-0.5 flex size-11 cursor-pointer items-center justify-center rounded-md border-0 bg-transparent text-ink",
            toggleStyle === "text" && "top-0.75 right-0.75 text-12 font-bold",
          )}
        >
          {toggleStyle === "text" ? (shown ? "Tutup" : "Lihat") : <Icon name={shown ? "eye-off" : "eye"} size={22} />}
        </button>
      }
    />
  );
}
